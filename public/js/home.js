import { getUpcomingFilms, MOVIE_DB_IMAGE_ENDPOINT_ORIGINAL } from "./at.js";

const carouselViewport = document.querySelector(".carousel");
let slides;
let dots;
var slideIndex = 1;
let tick = 0;

function setCarousel(data) {
    const films = data.results;
    let carouselItems = `<ul class="carousel__viewport">`;
    let carouselLists = "";
    for (let i = 0; i < 5; i++) {
        const film = films[i];
        const imageUrl = film.poster_path
            ? MOVIE_DB_IMAGE_ENDPOINT_ORIGINAL + film.backdrop_path
            : "https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg";

        carouselItems += `<li class="carousel__slide myfade" style="display: ${
            i == 0 ? "block" : "none"
        };">
                <a href="/movie/${film.id}">
                    <img src="${imageUrl}" alt="${film.title}" data-movie-id="${
            film.id
        }">
                </a>
            <div class="title">${film.title}</div>
            </li>`;
        carouselLists += `<li class="dot"></li>`;
    }

    carouselItems += `<a id="prev-carousel" class="prev">&#10094;</a><a id="next-carousel" class="next">&#10095;</a></ul><div class="carousel__navigation-list" style="text-align:center">`;
    carouselLists = `<ul>` + carouselLists + `</ul>`;
    carouselItems += carouselLists;
    const upcomingTitle = `<h2>Upcoming Movies</h2>`;
    carouselViewport.innerHTML = upcomingTitle + carouselItems;
    slides = document.getElementsByClassName("carousel__slide");
    dots = document.getElementsByClassName("dot");
    showSlides(slideIndex);

    for (let i = 0; i < slides.length; i++) {
        slides[i].onmouseover = function () {
            tick = 0;
        };
    }

    const prevCarousel = document.getElementById("prev-carousel");
    const nextCarousel = document.getElementById("next-carousel");
    const dot = document.getElementsByClassName("dot");

    prevCarousel.onclick = function () {
        plusSlides(-1);
    };
    nextCarousel.onclick = function () {
        plusSlides(1);
    };

    for (let i = 0; i < dot.length; i++) {
        dot[i].onclick = function () {
            selectSlide(i + 1);
        };
    }

    goTick();
}

async function goTick() {
    tick += 1;
    await new Promise((r) => setTimeout(r, 1000));
    if (tick >= 4) {
        plusSlides(1);
    }
    goTick();
}

// Next/previous controls
function plusSlides(n) {
    showSlides((slideIndex += n));
}

// Thumbnail image controls
function selectSlide(n) {
    showSlides((slideIndex = n));
}

function showSlides(n) {
    tick = 0;
    var i;
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}

export { getUpcomingFilms, setCarousel };
