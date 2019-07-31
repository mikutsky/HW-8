//Функция получает на сервере объект JSON, исходя из запроса, парсит его
function makeGetRequest(method, url, cb) {
  const xhr = new XMLHttpRequest();

  xhr.addEventListener("load", () => {
    const resParse = JSON.parse(xhr.responseText);
    cb(resParse);
  });

  xhr.open(method, url);
  xhr.send();
}

//Адресс сервера. Блок в документе, куда выведем список пользователей
//Блок в документе для вывода информации о пользователе
const usersURL = "https://jsonplaceholder.typicode.com/users";
const ul_users = document.querySelector("#list-of-users");
const ul_info = document.querySelector("#user-info");
const btnSubmit = document.querySelector("#btnSubmit");

//Функция выводит список пользователей
function renderUsersList(users) {
  const fragment = document.createDocumentFragment();

  users.forEach(el => {
    const user_li = document.createElement("li");
    user_li.dataset.userId = el.id;
    user_li.className = "list-group-item list-group-item-action";
    user_li.textContent = el.username;
    //Добавляем объект с пользователем во фрейм, назначаем событие
    fragment.appendChild(user_li);
    user_li.addEventListener("click", el => {
      //Снимаем выделение со всех элементов списка
      const selectUsersLI = ul_users.querySelector("li.active");
      if (selectUsersLI) selectUsersLI.classList.remove("active");
      //Выделяем нужный элемент и выводим информацию о пользователе
      el.target.classList.add("active");
      outUserInfo(
        users.find(user => user.id === Number(el.target.dataset.userId))
      );
    });
  });

  //добавляем сгенерированный фрагмент в документ
  ul_users.appendChild(fragment);
}

//Рекурсивная функция выводит информацию о пользователе из вложенных полей
function outUserInfo(user, rootField = "") {
  //Если в текущем поле объекта не вложенный объект - выводим значение,
  //иначе вызываем функцию с вложенным объектом
  for (const key in user)
    if (typeof user[key] !== "object") {
      const infoSpan = ul_info.querySelector(
        `span[data-text-field=${rootField + key}]`
      );
      if (infoSpan) infoSpan.textContent = user[key];
    } else {
      outUserInfo(user[key], rootField + key + "-");
    }
}

//Функция создает запись о новом пользователе
function OnAddUser() {
  //Зчем закрывает?!
  btnSubmit = document.querySelector("#btnSubmit");
  alert();
}

//Получаем список пользователей на сервере
makeGetRequest("GET", usersURL, renderUsersList);
