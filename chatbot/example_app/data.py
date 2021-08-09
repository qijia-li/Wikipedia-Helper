import requests
from bs4 import BeautifulSoup

import wikipediaapi


def getPage(link):
    response = requests.get(
        url=link,
    )
    soup = BeautifulSoup(response.content, 'html.parser')

    pg_title = soup.find(id="firstHeading").string

    wiki_wiki = wikipediaapi.Wikipedia(
        language='en',
        extract_format=wikipediaapi.ExtractFormat.WIKI
    )

    page_text = wiki_wiki.page(pg_title).text

    return pg_title, page_text


link = 'https://en.wikipedia.org/wiki/2021_Maharashtra_floods'
title, text = getPage(link)
print(title)
