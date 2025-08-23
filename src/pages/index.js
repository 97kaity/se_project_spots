import "./index.css";
import {
  enableValidation,
  disableButton,
  resetValidation,
  settings,
} from "../scripts/validation.js";
import { setButtonText } from "../utils/helpers.js";
import Api from "../utils/Api.js";

const initialCards = [
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
];

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "6d144b7c-5b1f-4932-9752-831fd2211d71",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([userInfo, cards]) => {
    document.querySelector(".profile__description").textContent =
      userInfo.about;
    document.querySelector(".profile__avatar").src = userInfo.avatar;
    document.querySelector(".profile__name").textContent = userInfo.name;
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });
  })
  .catch(console.error);

const profileEditButton = document.querySelector(".profile__edit-button");
const profileAddButton = document.querySelector(".profile__add-button");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalCloseButton = editModal.querySelector(".modal__close-button");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardModalCloseButton = cardModal.querySelector(".modal__close-button");
const avatarModalButton = document.querySelector(".profile__avatar-button");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");
const cardSubmitButton = cardModal.querySelector(".modal__submit-button");

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarModalCloseButton = avatarModal.querySelector(
  ".modal__close-button"
);
const avatarInput = avatarModal.querySelector("#profile-avatar-input");
const avatarSubmitButton = avatarModal.querySelector(".modal__submit-button");

const deleteModal = document.querySelector("#delete-modal");
const deleteModalCloseButton = document.querySelector(
  ".modal__delete-close-button"
);
const deleteModalSubmitButton = document.querySelector(".modal__submit-button");
const deleteModalCancelButton = document.querySelector(".modal__cancel-button");
const deleteForm = document.querySelector(".modal__form-delete");

const previewModal = document.querySelector("#preview-modal");
const previewModalImage = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");
const previewModalCloseButton = previewModal.querySelector(
  ".modal__preview-close-button"
);
const allModals = document.querySelectorAll(".modal");
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

let selectedCard, selectedCardId;

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscKey);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscKey);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  setButtonText(submitButton, true);
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false);
    });
}

function handleCardSubmitForm(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  setButtonText(submitButton, true);
  api
    .addNewCard({
      name: cardNameInput.value,
      link: cardLinkInput.value,
    })
    .then((data) => {
      const cardElement = getCardElement(data);
      cardsList.prepend(cardElement);
      cardForm.reset();
      disableButton(cardSubmitButton, settings);
      closeModal(cardModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false);
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  setButtonText(submitButton, true);
  api
    .editAvatarInfo({
      avatar: avatarInput.value,
    })
    .then((data) => {
      const profileAvatar = document.querySelector(".profile__avatar");
      profileAvatar.src = data.avatar;
      avatarForm.reset();
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false);
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  setButtonText(submitButton, true, "Delete", "Deleting...");
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false, "Delete", "Deleting...");
    });
}

function handleCardTrashButton(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data._id;
  openModal(deleteModal);
}

function handleLike(evt, data) {
  const isLiked = evt.target.classList.contains("card__like-button_liked");
  api
    .changeLikeStatus(data._id, isLiked)
    .then((data) => {
      if (data.isLiked) {
        evt.target.classList.add("card__like-button_liked");
      } else {
        evt.target.classList.remove("card__like-button_liked");
      }
    })
    .catch(console.error);
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardNameElement = cardElement.querySelector(".card__title");
  const cardImage = cardElement.querySelector(".card__image");
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardTrashButton = cardElement.querySelector(".card__trash-button");

  cardNameElement.textContent = data.name;
  cardImage.alt = data.name;
  cardImage.src = data.link;

  cardLikeButton.addEventListener("click", (evt) => {
    handleLike(evt, data);
  });

  cardTrashButton.addEventListener("click", (evt) => {
    handleCardTrashButton(cardElement, data);
    openModal(deleteModal);
  });

  deleteForm.addEventListener("submit", handleDeleteSubmit);

  cardImage.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImage.src = data.link;
    previewModalImage.alt = data.name;
    previewModalCaption.textContent = data.name;
  });

  return cardElement;
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
  openModal(editModal);
});

editModalCloseButton.addEventListener("click", () => {
  closeModal(editModal);
});

profileAddButton.addEventListener("click", () => {
  openModal(cardModal);
});

cardModalCloseButton.addEventListener("click", () => {
  closeModal(cardModal);
});

previewModalCloseButton.addEventListener("click", () => {
  closeModal(previewModal);
});

avatarModalButton.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseButton.addEventListener("click", () => {
  closeModal(avatarModal);
});

deleteModalCloseButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteModalCancelButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleCardSubmitForm);
avatarForm.addEventListener("submit", handleAvatarSubmit);

function handleEscKey(e) {
  if (e.key === "Escape") {
    const currentModal = document.querySelector(".modal_opened");
    if (currentModal) {
      closeModal(currentModal);
    }
  }
}

allModals.forEach((currentModal) => {
  currentModal.addEventListener("click", (e) => {
    if (e.target === currentModal) closeModal(currentModal);
  });
});

enableValidation(settings);
