//Функция получаем на сервере объект JSON, исходя из запроса и парсит его
function makeGetRequest(method, url, cb) {
  const xhr = new XMLHttpRequest();

  xhr.addEventListener("load", () => {
    const resParse = JSON.parse(xhr.responseText);
    cb(resParse);
  });

  xhr.open(method, url);
  xhr.send();
}

//Адресс сервера, блок в документе, куда положим список пользователей
//Блок для вывода информации о пользователе
const usersURL = "https://jsonplaceholder.typicode.com/users";
const id_usersUL = document.querySelector("#list-of-users");
const id_infoUL = document.querySelector("#user-info");

//Функция выводит список пользователей
function renderUsersList(users) {
  const objOfUsers = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});
  users.forEach(el => {
    const user_li = document.createElement("li");
    user_li.dataset.userId = el.id;
    user_li.className = "list-group-item list-group-item-action";
    user_li.textContent = el.username;

    id_usersUL.appendChild(user_li);
    user_li.addEventListener("click", el => {
      const selectUsersLI = id_usersUL.querySelector("li.active");
      if (selectUsersLI) selectUsersLI.classList.remove("active");

      el.target.classList.add("active");
      console.dir(objOfUsers);
      outUserInfo(objOfUsers[el.target.dataset.userId]);
    });
  });
}

//Функция выводит информацию о пользователе
function outUserInfo(user) {
  console.log(user);
  for (const key in user) {
    console.log(key);
    const value = user[key];
    if (typeof user[key] !== "object") {
      const infoSpan = id_infoUL.querySelector(`span[data-text-field=${key}]`);
      if (infoSpan) infoSpan.textContent = value;
    }
  }
}

//Получаем список пользователей на сервере
makeGetRequest("GET", usersURL, renderUsersList);
