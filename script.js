const navLinks = document.querySelectorAll('.navelement a');

const setActiveNav = () => {
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    const top = window.scrollY;
    const offset = section.offsetTop - 150;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (top >= offset && top < offset + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + id) {
          link.classList.add('active');
        }
      });
    }
  });
};

window.addEventListener('scroll', setActiveNav);
window.addEventListener('load', setActiveNav);

const generateForm = document.querySelector(".generate-form");
const imageGallery = document.querySelector(".image-gallery");
let isImageGenerating = false;

const showError = (message) => {
  alert(message || "Something went wrong. Please try again!");
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const downloadImage = async (imageUrl, filename) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    showError("Could not download the image.");
  }
};

const generateAIImage = async (userPrompt, userImgQuantity) => {
  const API_ENDPOINT = "/api/generate";

  try {
    isImageGenerating = true;
    imageGallery.innerHTML = "";
    for (let i = 0; i < userImgQuantity; i++) {
      const imgCardHTML = `<div class="img-card loading"><img src="img/loader.svg" alt="Generating..."></div>`;
      imageGallery.insertAdjacentHTML("beforeend", imgCardHTML);
    }

    // --- SCROLL TO SPELLBOOK SECTION ---
  
    document.getElementById('spellbook').scrollIntoView({ behavior: 'smooth' });

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userPrompt, quantity: userImgQuantity })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate images.");
    }

    const { images } = await response.json();
    const imgCards = imageGallery.querySelectorAll(".img-card");

    let initialDelay = 1000;
    let delayIncrement = 500;

    for (let i = 0; i < images.length; i++) {
      if (i >= imgCards.length) break;
      const currentDelay = initialDelay + (i * delayIncrement);
      await delay(currentDelay);
      const card = imgCards[i];
      const imageUrl = images[i];
      const filename = `wizz_art_${Date.now()}_${i}.png`;
      card.classList.remove("loading");
      card.innerHTML = `
        <img src="${imageUrl}" alt="Generated AI image">
        <button class="download-btn" onclick="downloadImage('${imageUrl}', '${filename}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="currentColor">
            <path d="M12 15.586l-4.293-4.293-1.414 1.414L12 18.414l5.707-5.707-1.414-1.414L12 15.586zM12 4a1 1 0 0 1 1 1v9.586l.293-.293 1.414 1.414-2.707 2.707a1 1 0 0 1-1.414 0l-2.707-2.707 1.414-1.414.293.293V5a1 1 0 0 1 1-1zM5 20h14a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2z"></path>
          </svg>
        </button>`;
    }

  } catch (error) {
    console.error("Client-side error:", error);
    showError(error.message);
    imageGallery.innerHTML = `<p style="color:white;">An error occurred. Please try again.</p>`;
  } finally {
    isImageGenerating = false;
  }
};

generateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (isImageGenerating) {
    showError("Please wait until the current generation completes.");
    return;
  }

  const promptInput = generateForm.querySelector(".prompt-input");
  const imgQuantitySelect = generateForm.querySelector(".img-quantity");
  const userPrompt = promptInput.value.trim();
  const userImgQuantity = parseInt(imgQuantitySelect.value);

  if (!userPrompt) {
    showError("Please enter a magical vision!");
    return;
  }
  
  generateAIImage(userPrompt, userImgQuantity);
});
