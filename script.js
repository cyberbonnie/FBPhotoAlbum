const pageId = 'FB_PAGE_ID'; // Replace with your Facebook Page ID
let accessToken = 'ACCESS_TOKEN'; // Replace with a valid page access token initially
const photosPerPage = 24; // Replace with desired number of photos per page
let currentPage = 1;
let photos = []; // Store all fetched photos here
async function fetchFacebookPhotos() {
  try {
    // Fetch all images attached to each posts with a limit on number of photos. Replace {subattachments.limit(XX)} with number of photos to fetch.
    const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}/posts?fields=id,message,created_time,attachments{subattachments.limit(96)}&access_token=${accessToken}`);
    const data = await response.json();
    photos = []; // Clear previous photo data
    let photoCount = 0;
    for (let post of data.data) {
      if (post.attachments) {
        for (let attachment of post.attachments.data) {
          if (attachment.type === 'photo' && photoCount < 96) { // Update with total number of photos to fetch
            photos.push(attachment.media.image.src);
            photoCount++;
          }
          if (attachment.subattachments) {
            for (let subattachment of attachment.subattachments.data) {
              if (subattachment.type === 'photo' && photoCount < 96) { // Update with total number of photos to fetch
                photos.push(subattachment.media.image.src);
                photoCount++;
              }
            }
          }
          if (photoCount >= 96) break; // Update with total number of photos to fetch
        }
      }
      if (photoCount >= 96) break; // Update with total number of photos to fetch
    }
    displayGallery(); // Show the gallery for the current page
    updatePaginationControls();
  } catch (error) {
    console.error('Error fetching photos:', error);
  }
}
// Function to display the gallery for the current page
function displayGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = ''; // Clear existing images
  const start = (currentPage - 1) * photosPerPage;
  const end = start + photosPerPage;
  const pagePhotos = photos.slice(start, end);
  pagePhotos.forEach(photoUrl => {
    const img = document.createElement('img');
    img.src = photoUrl;
    img.alt = "Facebook Photo";
    img.onclick = () => openLightbox(photoUrl); // Open lightbox on click
    gallery.appendChild(img);
  });
}
// Pagination control display
function updatePaginationControls() {
  const pageNumbers = document.getElementById('pageNumbers');
  pageNumbers.innerHTML = ''; // Clear current page numbers
  const totalPages = Math.ceil(photos.length / photosPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = 'pagination-button';
    pageButton.textContent = i;
// Add the active class to highlight the current page
if (i === currentPage) {
  pageButton.classList.add('active');
}
    pageButton.onclick = () => goToPage(i);
    pageNumbers.appendChild(pageButton);
  }
  // Update button states
  document.getElementById('prevButton').disabled = currentPage === 1;
  document.getElementById('nextButton').disabled = currentPage === totalPages;
}
let currentPhotoIndex = 0 //Track the current photo's index

// Lightbox functions
function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  currentPhotoIndex = photos.indexOf(src); // Find and store the current photo's index
  lightboxImg.src = src;
  lightbox.style.display = 'flex';
}
function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
}
// Show the previous photo in the lightbox
function prevPhoto() {
  currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length; // Wrap around to the last photo
  document.getElementById('lightbox-img').src = photos[currentPhotoIndex];
}
// Show the next photo in the lightbox
function nextPhoto() {
  currentPhotoIndex = (currentPhotoIndex + 1) % photos.length; // Wrap around to the first photo
  document.getElementById('lightbox-img').src = photos[currentPhotoIndex];
}
// Pagination functions
function nextPage() {
  currentPage++;
  displayGallery();
  updatePaginationControls();
}
function prevPage() {
  currentPage--;
  displayGallery();
  updatePaginationControls();
}
function goToPage(page) {
  currentPage = page;
  displayGallery();
  updatePaginationControls();
}
// Initial fetch and display setup
fetchFacebookPhotos();
setInterval(fetchFacebookPhotos, 43200000); // Refresh data every 12 hours