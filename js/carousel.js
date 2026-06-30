// Seleccionamos los elementos (asegúrate de que los nombres de las clases coincidan)
const track = document.querySelector('.carousel-track');
const nextBtn = document.querySelector('button.next');
const prevBtn = document.querySelector('button.prev');

nextBtn.addEventListener('click', () => {
  // Mide el ancho real de una tarjeta (incluyendo cómo cambió por el CSS)
  const itemWidth = document.querySelector('.item').offsetWidth;
  
  // Desplaza exactamente el espacio de 5 imágenes juntas
  track.scrollLeft += itemWidth * 5; 
});

prevBtn.addEventListener('click', () => {
  const itemWidth = document.querySelector('.item').offsetWidth;
  
  // Retrocede exactamente el espacio de 5 imágenes juntas
  track.scrollLeft -= itemWidth * 5;
});