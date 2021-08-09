import torch
from torch.utils.data import TensorDataset, DataLoader, RandomSampler, SequentialSampler
# from keras.preprocessing.sequence import pad_sequences
# from sklearn.model_selection import train_test_split
from pytorch_pretrained_bert import BertTokenizer, BertConfig
from pytorch_pretrained_bert import BertAdam, BertForSequenceClassification
from pytorch_pretrained_bert import BertForQuestionAnswering

from tqdm import tqdm, trange
# import pandas as pd
# import io
# import numpy as np
# import matplotlib.pyplot as plt
import collections
import json
from utils_squad import (convert_examples_to_features,
                         RawResult, _get_best_indexes, get_final_text, _compute_softmax)
from utils_squad_evaluate import EVAL_OPTS, main as evaluate_on_squad, plot_pr_curve


def to_list(tensor):
    return tensor.detach().cpu().tolist()


class Example(object):
    """
    A single training/test example for the Squad dataset.
    For examples without an answer, the start and end position are -1.
    """

    def __init__(self,
                 qas_id,
                 question_text,
                 doc_tokens,
                 orig_answer_text=None,
                 start_position=None,
                 end_position=None,
                 is_impossible=None):
        self.qas_id = qas_id
        self.question_text = question_text
        self.doc_tokens = doc_tokens
        self.orig_answer_text = orig_answer_text
        self.start_position = start_position
        self.end_position = end_position
        self.is_impossible = is_impossible


def my_read_squad_examples(text, paragraph):

    def is_whitespace(c):
        if c == " " or c == "\t" or c == "\r" or c == "\n" or ord(c) == 0x202F:
            return True
        return False

    examples = []
    doc_tokens = []
    char_to_word_offset = []
    prev_is_whitespace = True

    for c in paragraph:
        if is_whitespace(c):
            prev_is_whitespace = True
        else:
            if prev_is_whitespace:
                doc_tokens.append(c)
            else:
                doc_tokens[-1] += c
            prev_is_whitespace = False
        char_to_word_offset.append(len(doc_tokens) - 1)

    qas_id = 1

    example = Example(
        qas_id=qas_id,
        question_text=text,
        doc_tokens=doc_tokens
    )

    examples.append(example)
    return examples


def myModelPredict(text, paragraph):
    # val_examples <- text, paragraph
    val_examples = my_read_squad_examples(text, paragraph)
    max_seq_length = 256
    doc_stride = 128
    max_seq_length = 256
    max_query_length = 64
    batch_size = 1  # 32
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

    device = torch.device("cpu")

    # features are converted objects from examples
    features = convert_examples_to_features(examples=val_examples,
                                            tokenizer=tokenizer,
                                            max_seq_length=max_seq_length,
                                            doc_stride=doc_stride,
                                            max_query_length=max_query_length,
                                            is_training=False)

    # print(len(features))
    # f = features[0]
    # for f in features:
    #     print(f.example_index)
    #     print(f.unique_id)
    # print('='*30)
    # print(f.input_ids)
    # print(f.input_mask)
    # print(f.segment_ids)
    # print(f.cls_index)
    # print(f.p_mask)

    all_input_ids = torch.tensor(
        [f.input_ids for f in features], dtype=torch.long)
    all_input_mask = torch.tensor(
        [f.input_mask for f in features], dtype=torch.long)
    all_segment_ids = torch.tensor(
        [f.segment_ids for f in features], dtype=torch.long)
    all_cls_index = torch.tensor(
        [f.cls_index for f in features], dtype=torch.long)
    all_p_mask = torch.tensor([f.p_mask for f in features], dtype=torch.float)

    all_unique_ids = torch.tensor(
        [f.unique_id for f in features], dtype=torch.long)

    # dataset = TensorDataset(all_input_ids, all_input_mask, all_segment_ids,
    #                         all_cls_index, all_p_mask)

    dataset = TensorDataset(all_input_ids, all_input_mask, all_segment_ids,
                            all_cls_index, all_p_mask, all_unique_ids)

    # all_example_index = torch.arange(all_input_ids.size(0), dtype=torch.lox, all_p_mask)

    validation_sampler = SequentialSampler(dataset)
    validation_dataloader = DataLoader(
        dataset, sampler=validation_sampler, batch_size=batch_size, drop_last=False)

    ckpt_name = './pretrained_model'
    #print("Loading model from checkpoint %s" % ckpt_name)
    model = BertForQuestionAnswering.from_pretrained(ckpt_name)

    all_results = []

    for batch in tqdm(validation_dataloader, desc="Evaluating", miniters=100, mininterval=5.0):
        model.eval()
        # print(batch)

        batch = tuple(t.to(device) for t in batch)
        with torch.no_grad():
            inputs = {'input_ids':      batch[0],
                      'attention_mask': batch[1],
                      'token_type_ids': batch[2]}
            # a = batch[0]
            # b = batch[1]
            # c = batch[2]
            # print(batch[0])
            # print(batch[1])
            # print(batch[2])
            example_indices = batch[3]
            unique_ids = batch[5]

            # print('*'*30)
            # print(example_indices)
            outputs = model(**inputs)

        # print(a)
        # print(b)
        # print(c)
        # for i, example_index in enumerate(example_indices):

        #     eval_feature = features[example_index.item()]
        #     unique_id = int(eval_feature.unique_id)

        #     result = RawResult(unique_id=unique_id,
        #                        start_logits=to_list(outputs[0][i]),
        #                        end_logits=to_list(outputs[1][i]))
        #     all_results.append(result)

        for i, unique_id in enumerate(unique_ids):

            # eval_feature = features[example_index.item()]
            # unique_id = int(eval_feature.unique_id)
            # # TODO

            result = RawResult(unique_id=int(unique_id),
                               start_logits=to_list(outputs[0][i]),
                               end_logits=to_list(outputs[1][i]))
            all_results.append(result)

        # print(all_results)


# -------------------------------------------------------------------------------------------------------
    output_prediction_file = "./predictions.json"
    output_nbest_file = "./nbest_predictions.json"
    output_null_log_odds_file = "./null_odds.json"
    output_dir = "./predict_results"
    final_text, _ = get_predictions(val_examples, features, all_results, 10, 30, True,
                                    output_prediction_file, output_nbest_file, output_null_log_odds_file, False, True, 0.0)
    print('-'*30)
    print(final_text)
    print('-'*30)

    return final_text
    # i, j = start_logits, end_logits
    # all_input_ids[i:j]
    # id2word


# -------------------------------------------------------------------------------------------------------

    # print('-'*30)
    # print(result.unique_id)
    # print(result.start_logits)
    # print(result.end_logits)

    # selected_paragraph_ids = all_example_index[all_results[0]
    #                                            .start_logits:all_results[0].end_logits]

    # selected_paragraph = ' '.join([idx2word for idx in selected_paragraph_ids])

    # selected_paragraph = ''
    # return selected_paragraph


def get_predictions(all_examples, all_features, all_results, n_best_size,
                    max_answer_length, do_lower_case, output_prediction_file,
                    output_nbest_file, output_null_log_odds_file, verbose_logging,
                    version_2_with_negative, null_score_diff_threshold):
    # print(len(all_examples), len(all_features), len(all_results))
    # print(all_examples[0].qas_id)
    # print(all_examples[0].question_text)
    # print(all_examples[0].doc_tokens)

    # example_index_to_features is a new dictionary-like object.
    example_index_to_features = collections.defaultdict(list)

    for feature in all_features:
        example_index_to_features[feature.example_index].append(feature)

    unique_id_to_result = {}
    for result in all_results:
        # print(result.unique_id)
        unique_id_to_result[result.unique_id] = result

    _PrelimPrediction = collections.namedtuple(  # pylint: disable=invalid-name
        "PrelimPrediction",
        ["feature_index", "start_index", "end_index", "start_logit", "end_logit"])

    all_predictions = collections.OrderedDict()
    all_nbest_json = collections.OrderedDict()
    scores_diff_json = collections.OrderedDict()

    for (example_index, example) in enumerate(all_examples):
        features = example_index_to_features[example_index]

        prelim_predictions = []
        # keep track of the minimum score of null start+end of position 0
        score_null = 1000000  # large and positive
        min_null_feature_index = 0  # the paragraph slice with min null score
        null_start_logit = 0  # the start logit at the slice with min null score
        null_end_logit = 0  # the end logit at the slice with min null score
        # print(len(features))
        for (feature_index, feature) in enumerate(features):
            # print('-'*30)
            # print(unique_id_to_result.keys())
            # print(unique_id_to_result[1000000000])
            # print(feature.unique_id)
            # print(unique_id_to_result[feature.unique_id])
            result = unique_id_to_result[feature.unique_id]
            start_indexes = _get_best_indexes(result.start_logits, n_best_size)
            end_indexes = _get_best_indexes(result.end_logits, n_best_size)
            # if we could have irrelevant answers, get the min score of irrelevant
            if version_2_with_negative:
                feature_null_score = result.start_logits[0] + \
                    result.end_logits[0]
                if feature_null_score < score_null:
                    score_null = feature_null_score
                    min_null_feature_index = feature_index
                    null_start_logit = result.start_logits[0]
                    null_end_logit = result.end_logits[0]
            for start_index in start_indexes:
                for end_index in end_indexes:
                    # We could hypothetically create invalid predictions, e.g., predict
                    # that the start of the span is in the question. We throw out all
                    # invalid predictions.
                    if start_index >= len(feature.tokens):
                        continue
                    if end_index >= len(feature.tokens):
                        continue
                    if start_index not in feature.token_to_orig_map:
                        continue
                    if end_index not in feature.token_to_orig_map:
                        continue
                    if not feature.token_is_max_context.get(start_index, False):
                        continue
                    if end_index < start_index:
                        continue
                    length = end_index - start_index + 1
                    if length > max_answer_length:
                        continue
                    prelim_predictions.append(
                        _PrelimPrediction(
                            feature_index=feature_index,
                            start_index=start_index,
                            end_index=end_index,
                            start_logit=result.start_logits[start_index],
                            end_logit=result.end_logits[end_index]))
        if version_2_with_negative:
            prelim_predictions.append(
                _PrelimPrediction(
                    feature_index=min_null_feature_index,
                    start_index=0,
                    end_index=0,
                    start_logit=null_start_logit,
                    end_logit=null_end_logit))
        prelim_predictions = sorted(
            prelim_predictions,
            key=lambda x: (x.start_logit + x.end_logit),
            reverse=True)

        _NbestPrediction = collections.namedtuple(  # pylint: disable=invalid-name
            "NbestPrediction", ["text", "start_logit", "end_logit"])

        seen_predictions = {}
        nbest = []
        for pred in prelim_predictions:
            if len(nbest) >= n_best_size:
                break
            feature = features[pred.feature_index]
            if pred.start_index > 0:  # this is a non-null prediction
                tok_tokens = feature.tokens[pred.start_index:(
                    pred.end_index + 1)]
                orig_doc_start = feature.token_to_orig_map[pred.start_index]
                orig_doc_end = feature.token_to_orig_map[pred.end_index]
                orig_tokens = example.doc_tokens[orig_doc_start:(
                    orig_doc_end + 1)]
                tok_text = " ".join(tok_tokens)

                # De-tokenize WordPieces that have been split off.
                tok_text = tok_text.replace(" ##", "")
                tok_text = tok_text.replace("##", "")

                # Clean whitespace
                tok_text = tok_text.strip()
                tok_text = " ".join(tok_text.split())
                orig_text = " ".join(orig_tokens)

                final_text = get_final_text(
                    tok_text, orig_text, do_lower_case, verbose_logging)
                if final_text in seen_predictions:
                    continue

                seen_predictions[final_text] = True
            else:
                final_text = ""
                seen_predictions[final_text] = True

            nbest.append(
                _NbestPrediction(
                    text=final_text,
                    start_logit=pred.start_logit,
                    end_logit=pred.end_logit))

        # if we didn't include the empty option in the n-best, include it
        if version_2_with_negative:
            if "" not in seen_predictions:
                nbest.append(
                    _NbestPrediction(
                        text="",
                        start_logit=null_start_logit,
                        end_logit=null_end_logit))

            # In very rare edge cases we could only have single null prediction.
            # So we just create a nonce prediction in this case to avoid failure.
            if len(nbest) == 1:
                nbest.insert(0,
                             _NbestPrediction(text="empty", start_logit=0.0, end_logit=0.0))

        # In very rare edge cases we could have no valid predictions. So we
        # just create a nonce prediction in this case to avoid failure.
        if not nbest:
            nbest.append(
                _NbestPrediction(text="empty", start_logit=0.0, end_logit=0.0))

        assert len(nbest) >= 1

        total_scores = []
        best_non_null_entry = None
        for entry in nbest:
            total_scores.append(entry.start_logit + entry.end_logit)
            if not best_non_null_entry:
                if entry.text:
                    best_non_null_entry = entry

        probs = _compute_softmax(total_scores)

        nbest_json = []
        for (i, entry) in enumerate(nbest):
            output = collections.OrderedDict()
            output["text"] = entry.text
            output["probability"] = probs[i]
            output["start_logit"] = entry.start_logit
            output["end_logit"] = entry.end_logit
            nbest_json.append(output)

        assert len(nbest_json) >= 1

        if not version_2_with_negative:
            all_predictions[example.qas_id] = nbest_json[0]["text"]
        else:
            # predict "" iff the null score - the score of best non-null > threshold
            score_diff = score_null - best_non_null_entry.start_logit - (
                best_non_null_entry.end_logit)
            scores_diff_json[example.qas_id] = score_diff
            if score_diff > null_score_diff_threshold:
                all_predictions[example.qas_id] = ""
            else:
                all_predictions[example.qas_id] = best_non_null_entry.text
        all_nbest_json[example.qas_id] = nbest_json

    with open(output_prediction_file, "w") as writer:
        writer.write(json.dumps(all_predictions, indent=4) + "\n")

    with open(output_nbest_file, "w") as writer:
        writer.write(json.dumps(all_nbest_json, indent=4) + "\n")

    if version_2_with_negative:
        with open(output_null_log_odds_file, "w") as writer:
            writer.write(json.dumps(scores_diff_json, indent=4) + "\n")

    return final_text, all_predictions


# def get_predictions():
#     return ''


# text = ''
# paragraph = ''
# result = myModelPredict(text, paragraph)
# paragraph = paragraph_1 + paragraph_1 + paragraph_1 + \
#     paragraph_1 + paragraph_1 + paragraph_1
# answer = myModelPredict(text, paragraph)

# print(answer)
