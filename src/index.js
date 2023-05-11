import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

const form = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadBtn = document.querySelector('.js-load-btn');
const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '36285780-5e432e43a01ab0bbeda1983f2';
const params = `?key=${API_KEY}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40`;

const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
  scrollbarWidth: 20,
});

let page = 1;
let q = null;

async function getPictures(search) {
  if (search !== q) {
    page = 1;
    q = search;
  }
  try {
    const response = await axios.get(
      `${BASE_URL}${params}&q=${q}&page=${page}`
    );
    page += 1;
    return response.data;
  } catch (error) {
    Notiflix.Notify.failure('Something went wrong! Please retry');
    console.log(error);
  }
}

function createMarkup(photo) {
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments_count,
    downloads,
  } = photo;
  return `<div class="photo-card">
      <a class="photo-card__link " href="${largeImageURL}"><img class="photo-card__image" src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          ${likes}
        </p>
        <p class="info-item">
          <b>Views</b>
          ${views}
        </p>
        <p class="info-item">
          <b>Comments</b>
          ${comments_count}
        </p>
        <p class="info-item">
          <b>Downloads</b>
          ${downloads}
        </p>
      </div>
    </div>`;
}

async function onSubmit(event) {
  event.preventDefault();
  const searchQuery = event.currentTarget.elements.searchQuery.value
    .trim()
    .toLowerCase();
  if (!searchQuery) {
    Notiflix.Notify.failure('Enter a search query!');
    return;
  }
  try {
    const searchData = await getPictures(searchQuery);
    const { hits, totalHits } = searchData;
    if (hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images!`);
    const markup = hits.map(item => createMarkup(item)).join('');
    galleryEl.innerHTML = markup;
    if (totalHits > 40) {
      loadBtn.classList.remove('js-load-btn');
      page += 1;
    }
    lightbox.refresh(); // Initialize the lightbox here
  } catch (error) {
    Notiflix.Notify.failure('Something went wrong! Please retry');
    console.log(error);
  }
}

async function onLoadClick() {
  if (!q) {
    return;
  }
  const response = await getPictures(q);
  const { hits, totalHits } = response;
  const markup = hits.map(item => createMarkup(item)).join('');
  galleryEl.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh(); // Refresh the lightbox after new images have been loaded
  page += 1;
  const amountOfPages = totalHits / 40 - page;
  if (amountOfPages < 1) {
    loadBtn.classList.add('js-load-btn');
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

form.addEventListener('submit', onSubmit);
loadBtn.addEventListener('click', onLoadClick);
