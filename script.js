const apiKey = '45f281fb79090677626a54d1f913c4bc';

// Elements
const cardContainer = document.getElementById('trending-cards');
const buttons = document.querySelectorAll('.time-toggle button');

const trailerContainer = document.getElementById("trailer-container");
const trailerButtons = document.querySelectorAll('.trailers-buttons .trailer-btn');

const popularSlider = document.getElementById('popular-slider');
const popularButtons = document.querySelectorAll('.popular-btn');

const freeSlider = document.getElementById('free-slider');
const freeMovieBtn = document.getElementById('freeMovieBtn');
const freeTvBtn = document.getElementById('freeTvBtn');

// === Fetch Trending Movies ===
function fetchTrending(period = 'day') {
  fetch(`https://api.themoviedb.org/3/trending/movie/${period}?api_key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      cardContainer.innerHTML = '';
      data.results.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w220_and_h330_face${movie.poster_path}" alt="${movie.title}" />
          <div class="card-info">
            <h3>${movie.title || movie.name}</h3>
            <p>⭐ ${movie.vote_average}</p>
          </div>
        `;
        cardContainer.appendChild(card);
      });
    })
    .catch(err => console.error('Error fetching trending movies:', err));
}

// === Fetch Latest Trailers ===
async function getLatestTrailers(category = 'popular') {
  try {
    const categories = {
      popular: 'popular',
      streaming: 'on_the_air',
      'on-tv': 'airing_today',
      'for-rent': 'now_playing',
      'in-theaters': 'now_playing',
    };

    const categoryEndpoint = categories[category];
    const res = await fetch(`https://api.themoviedb.org/3/movie/${categoryEndpoint}?api_key=${apiKey}&language=en-US`);
    const data = await res.json();
    const movies = data.results.slice(0, 10);

    trailerContainer.innerHTML = '';

    for (const movie of movies) {
      const videoRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${apiKey}`);
      const videoData = await videoRes.json();
      const trailer = videoData.results.find(v => v.type === "Trailer" && v.site === "YouTube");

      if (trailer) {
        const trailerCard = document.createElement("div");
        trailerCard.classList.add("trailer-card");
        trailerCard.innerHTML = `
          <iframe width="100%" height="100%" 
            src="https://www.youtube.com/embed/${trailer.key}" 
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>`;
        trailerContainer.appendChild(trailerCard);
      }
    }
  } catch (error) {
    console.error("Error fetching latest trailers:", error);
  }
}

// === Fetch What's Popular ===
async function fetchPopular(type = 'movie', category = 'popular') {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/${type}/${category}?api_key=${apiKey}`);
    const data = await res.json();
    popularSlider.innerHTML = '';

    data.results.slice(0, 15).forEach(item => {
      const card = document.createElement('div');
      card.className = 'popular-card';
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w220_and_h330_face${item.poster_path}" alt="${item.title || item.name}" />
        <div class="title">${item.title || item.name}</div>
      `;
      popularSlider.appendChild(card);
    });
  } catch (err) {
    console.error('Error fetching popular items:', err);
  }
}

// === Fetch Free to Watch ===
async function loadFreeToWatch(type = 'movie') {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&with_watch_monetization_types=free&sort_by=popularity.desc`);
    const data = await res.json();
    renderFreeContent(data.results, type);
  } catch (err) {
    console.error('Error fetching free to watch:', err);
  }
}

function renderFreeContent(items, type) {
  freeSlider.innerHTML = '';
  items.slice(0, 15).forEach(item => {
    const title = type === 'movie' ? item.title : item.name;
    const date = type === 'movie' ? item.release_date : item.first_air_date;
    const imgPath = item.poster_path
      ? `https://image.tmdb.org/t/p/w220_and_h330_face${item.poster_path}`
      : 'https://via.placeholder.com/220x330?text=No+Image';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${imgPath}" alt="${title}" />
      <div class="card-info">
        <h3>${title}</h3>
        <p>${date || 'N/A'}</p>
      </div>
    `;
    freeSlider.appendChild(card);
  });
}

// === Initial Load ===
fetchTrending();
getLatestTrailers('popular');
fetchPopular(); // default: movie/popular
loadFreeToWatch(); // default: movie/free

// === Toggle Trending Period Buttons ===
buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    fetchTrending(button.dataset.period);
  });
});

// === Toggle Trailer Category Buttons ===
trailerButtons.forEach(button => {
  button.addEventListener('click', () => {
    trailerButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    const category = button.getAttribute('data-category');
    getLatestTrailers(category);
  });
});

// === Toggle What's Popular Buttons ===
popularButtons.forEach(button => {
  button.addEventListener('click', () => {
    popularButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const type = button.dataset.type;
    const category = button.dataset.category;
    fetchPopular(type, category);
  });
});

// === Toggle Free to Watch Buttons ===
if (freeMovieBtn && freeTvBtn) {
  freeMovieBtn.addEventListener('click', () => {
    freeMovieBtn.classList.add('active');
    freeTvBtn.classList.remove('active');
    loadFreeToWatch('movie');
  });

  freeTvBtn.addEventListener('click', () => {
    freeTvBtn.classList.add('active');
    freeMovieBtn.classList.remove('active');
    loadFreeToWatch('tv');
  });
}
