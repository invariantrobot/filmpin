from selenium import webdriver
from selenium.webdriver.common.by import By
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pickle as pk
import polars as pl
import time


edge_options = EdgeOptions()
edge_options.add_argument("--headless=new")         # comment this line once to debug visually
edge_options.add_argument("--window-size=1920,1080")
edge_options.add_argument("--disable-blink-features=AutomationControlled")
edge_options.add_experimental_option("excludeSwitches", ["enable-automation"])
edge_options.add_experimental_option("useAutomationExtension", False)
edge_options.add_argument("accept-language=en-US,en;q=0.9")
edge_options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/140.0.0.0"
)
service = EdgeService(executable_path=r"../msedgedriver.exe")

def clickConsent(driver):
    time.sleep(1)
    driver.find_element(
                By.XPATH, "//*[self::button or @role='button'][contains(.,'Accept') or contains(.,'Agree') or contains(.,'Godkänn')]"
            ).click()
    time.sleep(1)
    
def clickMore(driver, scroll =  100):
    # scroll until found
    success = False 
    iter = 0
    while not success:
        try:
            btn = driver.find_element(
                By.XPATH, "//button[.//span[contains(@class,'ipc-see-more__text') and contains(., 'more')]]"
            )
            btn.click()
            success = True
        except:
            pass
        driver.execute_script(f"window.scrollBy(0, {scroll});")
        time.sleep(0.3)
        iter += 1
        if iter > 25:
            print("Failed to find more button")
            break

def scrapeLocations(currentMovie):
    driver = webdriver.Edge(
        service=service,
        options=edge_options
    )
    

    # Load the URL
    url = f"https://imdb.com/title/{currentMovie}/locations"
    print("Scraping: ", url)
    driver.get(url)

    # Click consent
    clicked = False
    iter = 0
    while not clicked and iter < 10:
        try: 
            clickConsent(driver)
            clicked = True
        except:
            iter += 1
            pass
    
    if not clicked:
        print("Failed to Scrape")
        return []
    
    # Find and click "more" button 
    clickMore(driver)
    
    time.sleep(0.1)

    allLocations = []

    # Extract all cards from the page
    cards = driver.find_elements(By.XPATH, '//div[@data-testid="item-id"]')

    for card in cards: # Loop over all location cards on the page
        try:
            votes = card.find_element(By.XPATH, ".//span[@class='ipc-voting__label__count ipc-voting__label__count--up']")
            if int(votes.text) < 6: # Only take cards that have been voted alot on
                break
        except:
            break
        location = card.find_elements(By.XPATH, ".//a[@data-testid='item-text-with-link']")
        place = card.find_elements(By.XPATH, ".//p[@data-testid='item-attributes']")

        allLocations.append([location[0].text, place[0].text if place else ""])
        
    driver.quit()

    # return scraped data
    return allLocations

def scrapeArea(country = "sweden", city = "stockholm"):
    driver = webdriver.Edge(
        service=service,
        options=edge_options
    )
    url = f"https://www.imdb.com/search/title/?title_type=feature&locations={country}@@@%20{city}&sort=num_votes,desc"
    print("Scraping: ", url)
    driver.get(url)

    # Click consent
    clickConsent(driver)
    time.sleep(0.1)

    clickMore(driver, scroll = 500)

    clickMore(driver, scroll = 500)

    cards = driver.find_elements(By.XPATH, "//li[@class='ipc-metadata-list-summary-item']")

    movies = {}
    
    for card in cards:
        movieName = card.find_elements(By.XPATH, ".//h3[@class='ipc-title__text ipc-title__text--reduced']")
        releaseYear = card.find_elements(By.XPATH, ".//span[@class='sc-15ac7568-7 cCsint dli-title-metadata-item']")
        movies[movieName[0].text.split('. ')[1]] = releaseYear[0].text
    driver.quit()

    print(f"Collected {len(movies)} titles from {city}")
    return movies

def scrapePopularMovies():
    driver = webdriver.Edge(
        service=service,
        options=edge_options
    )
    element_list = []

    # Load the URL
    url = f"https://www.imdb.com/chart/top/"
    driver.get(url)

    # Click consent
    clickConsent(driver)
    time.sleep(0.1)

    cards = driver.find_elements(By.XPATH, "//li[@class='ipc-metadata-list-summary-item']")

    movies = {}

    for card in cards:
        movieName = card.find_elements(By.XPATH, ".//h3[@class='ipc-title__text ipc-title__text--reduced']")
        releaseYear = card.find_elements(By.XPATH, ".//span[@class='sc-15ac7568-7 cCsint cli-title-metadata-item']")
        movies[movieName[0].text.split('. ')[1]] = releaseYear[0].text
    driver.quit()

    return movies

def getPopularMovies(allMovies):
    popularDataSet = None
    try: # Try to open if already scraped
        with open('mostPopular.pk', 'rb') as f:
            popularDataSet = pk.load(f)
    except:
        print("No most popular database found, scraping and creating dataset")
        popularDataSetMovieNames = scrapePopularMovies()
        popularDataSetMovieNames.update(scrapeArea())
        popularDataSet = []
        for movieName in popularDataSetMovieNames.keys(): # Convert to tconst format
            tconsts = (
                allMovies
                .filter((pl.col("titleType") == "movie") &
                        (pl.col("primaryTitle").str.to_lowercase() == movieName.lower()) &
                         (pl.col("startYear") == int(popularDataSetMovieNames[movieName]))
                        )
                .select("tconst")
                .to_series()
                .to_list()
            )
            if tconsts: # Sloppy, find a way to take the correct title if more are present
                popularDataSet.append(tconsts[0])
        with open('mostPopular.pk', 'wb') as f:
            print("Dumping populardataset: ", popularDataSet)
            pk.dump(popularDataSet, f)
    
    if popularDataSet:
        return popularDataSet
    else:
        raise "No dataset created or found for popular movies"

def getAdditionalMovies(titles, allMovies):
    ids = []
    for title in titles:
        newIds = allMovies.filter(pl.col("primaryTitle").str.contains(title)) # The id of the title

        newIds = newIds.filter(pl.col("titleType").str.contains("movie")) # Sort of irrelevant titles from the search

        newIds = newIds.filter(~(pl.col("genres").str.contains("Documentary") |
                                 pl.col("genres").str.contains("Music") |
                                 pl.col("genres").str.contains("Comedy") |
                                 pl.col("genres").str.contains("Animation")
                                 ))
        newIds = (newIds.select("tconst").unique()
            .to_series()
            .to_list()
        )
        
        ids = ids + newIds
    print("Additional ids: ", ids)
    return ids
            
def runScrape(): # All methods run to scrape all websites
    titles = ["Harry Potter", "The Lord of the Rings"]
    allMoviesDF = pl.read_csv(r"../title.basics.tsv", separator = "\t", null_values="\\N", quote_char=None)
    allMovies = list(set(getAdditionalMovies(titles, allMoviesDF) + getPopularMovies(allMoviesDF))) #Make sure there are not duplicates

    dataset = None
    try:
        with open("locationDataset.pk", "rb") as f:
            dataset = pk.load(f)
            print(dataset)
    except:
        dataset = {}
    iter = 0
    iterFail = 0
    iterSkipped = 0
    print("current keys: ", dataset.keys())
    dumped = False

    try:
        for movie in allMovies:
            if movie in dataset: # If already scraped, ignore
                print("skipped")
                iter += 1
                iterSkipped += 1
                continue
            locations = scrapeLocations(movie)
            if len(locations) != 0:
                dataset[movie] = locations
            else:
                iterFail += 1
            iter += 1
            print(f"Done with {iter}/{len(allMovies)}")
            print(f"Failed to find locations on: {iterFail} websites")
            print(f"Skipped {iterSkipped} movies")
    except KeyboardInterrupt: # Save progress
        with open("locationDataset.pk", "wb") as f:
            print("Dumped data ")
            pk.dump(dataset, f)
            dumped = True

    if not dumped:
        with open("locationDataset.pk", "wb") as f:
            pk.dump(dataset, f)

if __name__ == '__main__':
    runScrape()