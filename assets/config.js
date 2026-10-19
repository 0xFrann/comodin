// Datos que aparecen en la tarjeta y adónde guarda el emisor.
window.COMODIN_CONFIG = {
  nombre: "Franco Dalmasso",
  corto: "Franco",
  rol: "Product Design Engineer",
  whatsapp: "5493517881648",                       // solo números, con código de país
  linkedin: "https://www.linkedin.com/in/franndalmasso",
  cv: "https://0xfrann.github.io/ethereum-tree-seams/cv.pdf",

  // Dirección pública de la tarjeta (GitHub Pages de este repo)
  base: "https://0xfrann.github.io/comodin/",

  // Repo PRIVADO donde el emisor guarda la mini base de datos
  registro: { owner: "0xfrann", repo: "comodin-registro", path: "emisiones.json" },

  // Clave para ofuscar nombre y fecha en el link. No es cifrado real:
  // solo evita que se lean a simple vista. Si la cambiás, los links viejos dejan de mostrar el nombre.
  clave: "mate-amargo-y-tortitas"
};
