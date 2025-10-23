import requests
from bs4 import BeautifulSoup

url = 'https://www.imdb.com/title/tt0120737/locations'
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://www.imdb.com/",
}

response = requests.get(url=url, headers=headers)



soup = BeautifulSoup(response.content, 'html.parser')

content_div = soup.find('div', class_='sc-472717c3-0 cSVLLn')

if content_div:
    for para in content_div.find_all('p'):
        print(para.text.strip())
else:
    print("No article content found.")

print(soup.prettify())