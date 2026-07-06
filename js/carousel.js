// Seleccionamos TODOS los carruseles de la página
const carousels = document.querySelectorAll('.netflix-carousel');

carousels.forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const nextBtn = carousel.querySelector('button.next');
  const prevBtn = carousel.querySelector('button.prev');

  nextBtn.addEventListener('click', () => {
    const itemWidth = carousel.querySelector('.item').offsetWidth;
    track.scrollLeft += itemWidth * 5;
  });

  prevBtn.addEventListener('click', () => {
    const itemWidth = carousel.querySelector('.item').offsetWidth;
    track.scrollLeft -= itemWidth * 5;
  });
});