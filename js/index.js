'use strict';

const API_KEY = 'a36391c9affd411982fd7e1f8e9fcf01';

const choicesElem = document.querySelector('.js_choice');

const newsList = document.querySelector('.news_list');

const formSearch = document.querySelector('.form_search');

const title = document.querySelector('.title');

const declOfNum = (n, titles) => {
  return (
    n +
    ' ' +
    titles[
      n % 10 === 1 && n % 100 !== 11
        ? 0
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
        ? 1
        : 2
    ]
  );
};

const choices = new Choices(choicesElem, {
  searchEnabled: false,
  itemSelectText: '',
});

const getData = async url => {
  const response = await fetch(url, {
    headers: {
      'X-Api-Key': API_KEY,
    },
  });
  const data = await response.json();

  return data;
};

const getCorrectFormat = isoDate => {
  const date = new Date(isoDate);
  const fullDate = date.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const fullTime = date.toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `<span class="news_date">${fullDate}</span> ${fullTime}`;
};

const getImage = url =>
  new Promise(resolve => {
    const image = new Image(270, 200);
    image.addEventListener('load', () => {
      resolve(image);
    });

    image.addEventListener('error', () => {
      image.src = url || 'img/nophoto.jpg';
      resolve(image);
    });

    image.src = url || 'img/nophoto.jpg';
    image.className = 'news_image';

    return image;
  });

const renderCard = data => {
  newsList.textContent = '';
  data.forEach(async ({ urlToImage, title, url, description, publishedAt, author }) => {
    const card = document.createElement('li');
    card.className = 'news_item';

    const image = await getImage(urlToImage);
    image.alt = title;
    card.append(image);

    card.insertAdjacentHTML(
      'beforeend',
      `
        <h3 class="news_title">
            <a href="${url} class="news_link" target="_blank">${title || ''}</a>
        </h3>
        <p class="news_decription">${description || ''}</p>
        <div class="news_footer">
            <time class="news_datetime" datetime="${publishedAt}">
                ${getCorrectFormat(publishedAt)}
            </time>
            <div class="news_author">${author || ''}</div>
        </div>
        `
    );

    newsList.append(card);
  });
};

const loadNews = async () => {
  // newsList.innerHTML = '<li class="preload"></li>';
  const preload = document.createElement('li');
  preload.className = 'preload';
  newsList.append(preload);

  const country = localStorage.getItem('country') || 'ua';
  choices.setChoiceByValue(country);
  title.classList.add('hide');

  const data = await getData(
    `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=100`
  );
  renderCard(data.articles);
};

const loadSearch = async value => {
  const data = await getData(`https://newsapi.org/v2/everything?q=${value}&pageSize=100`);
  title.classList.remove('hide');
  title.textContent = `По вашему запросу “${value}” найдено 
  ${declOfNum(data.articles.length, ['результат', 'результата', 'результатов'])}:`;

  choices.setChoiceByValue('');
  renderCard(data.articles);
};

choicesElem.addEventListener('change', e => {
  const value = e.detail.value;
  localStorage.setItem('country', value);
  loadNews(value);
});

formSearch.addEventListener('submit', e => {
  e.preventDefault();
  loadSearch(formSearch.search.value);
  formSearch.reset();
});

loadNews();
