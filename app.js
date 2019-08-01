//Функция получает на сервере объект JSON, исходя из запроса, парсит его
function makeRequest(method, url, cb, userObj) {
  try {
    const body = JSON.stringify(userObj);
    const xhr = new XMLHttpRequest();

    //Событие завершения получения данных
    xhr.addEventListener("load", () => {
      //Статус не в диапазоне 200-299. Т.е. загрузка завершилось с ошибкой
      if (!String(xhr.status).startsWith("2")) {
        cb(`Error! Status code:${xhr.status}`);
        return;
      }
      const resParse = JSON.parse(xhr.responseText);
      cb(null, resParse);
    });

    //Событие ошибки
    xhr.addEventListener("error", () => cb("Error! Error event received."));
    xhr.open(method, url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(body);
  } catch (err) {
    cb(err);
  }
}

//Адресс сервера. Блок в документе, куда выведем список пользователей
//Блок в документе для вывода информации о пользователе
const usersURL = "https://jsonplaceholder.typicode.com/users";
const ul_users = document.querySelector("#list-of-users");
const ul_info = document.querySelector("#user-info");

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
      //у всех удаляем класс "active"
      ul_users
        .querySelectorAll("li.active")
        .forEach(el => el.classList.remove("active"));
      //у кликнутого элемента делаем тоггл класса
      el.target.classList.toggle("active");

      //Выведем информацию выбранного пользователя
      ul_info.querySelectorAll("li span").forEach(el => (el.textContent = ""));
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

//Функция проверяет наличие значений в полях с переданными названиями
//если все поля заполненны возвращает true, иначе возвращает false и
//создает div-ы с предупрежденияим
function checkRequiredFields() {
  let result = true;
  //Удаляем все старые div-ы с предупреждениями
  document.forms[0]
    .querySelectorAll('[role="alert"]')
    .forEach(el => el.remove());

  for (const field of arguments) {
    const inputField = document.forms[0].querySelector(`#${field}`);

    //Проверяем заполнены ли обязаельные поля в форме,
    //если нет, создаем div с предупреждением под каждым проверяемым input-ом
    if (!inputField.value) {
      result = false;

      //В родительском элементе находим label и берем красивое название поля
      const fieldTitle = inputField.parentElement
        .querySelector("label")
        .textContent.slice(
          0,
          inputField.parentElement
            .querySelector("label")
            .textContent.indexOf(":")
        );

      //Разметка div с предупреждением
      const divWarning = document.createElement("div");
      divWarning.className = "alert alert-warning mt-2 mb-0";
      divWarning.setAttribute("role", "alert");

      const strongWarning = document.createElement("strong");
      strongWarning.textContent = "Warning!";
      divWarning.appendChild(strongWarning);
      const pWarning = document.createElement("p");
      pWarning.className = "text-right m-0";
      pWarning.textContent = `Enter another value in the "${fieldTitle}" field.`;
      divWarning.appendChild(pWarning);

      inputField.parentElement.appendChild(divWarning);
    }
  }

  return result;
}

//Функция создает объект с новым пользователем, и отправляет на сервер
function OnAddUser(el) {
  el.preventDefault();

  //Если НЕ все обязательные поля заполнены, прерываем функцию
  if (!checkRequiredFields("name", "username")) return;

  //Собираем все введеные значения о новом пользователе в объект
  const userObj = Array.from(
    document.forms[0].querySelectorAll("input")
  ).reduce((acc, el) => {
    acc[el.id] = el.value;
    return acc;
  }, {});

  //Отправляем заполненный объект пользователя на сервер, если объект успешно
  //добавлен на сервере, добавляем его в наш список
  makeRequest(
    "POST",
    usersURL,
    (err, res) => {
      if (err) {
        alert(err);
        return;
      }
      renderUsersList([res]);
      console.log(res);
    },
    userObj
  );
  //сбрасываем форму
  el.target.closest("form").reset();
}

//Получаем список пользователей на сервере, проверяем наличие ошибок
makeRequest("GET", usersURL, (err, res) => {
  if (err) {
    alert(err);
    return;
  }
  renderUsersList(res);
});

//Назначаем обработчик события на кнопку "Add", добавляющее пользователя
document.querySelector("#btnSubmit").addEventListener("click", OnAddUser);
