import type { PaginatedResponse, User } from "../types/api";

export default function userSearchResultsRender(
  container: HTMLElement,
  result: PaginatedResponse<User>,
  onChoose: (user: User) => void
): void {
  container.replaceChildren();

  const total = document.createElement("p");
  total.textContent = `${result.total} usuários encontrados`;
  container.append(total);

  if (result.data.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Nenhum usuário encontrado";
    container.append(empty);
    return;
  }

  const list = document.createElement("ul");
  list.classList.add("list-group");

  result.data.forEach((user) => {
    const item = document.createElement("li");
    item.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "gap-2");

    const details = document.createElement("span");
    const location = [user.city, user.state].filter(Boolean).join("/");
    details.textContent = [user.name, user.email, user.job_title, location].filter(Boolean).join(" · ");

    const choose = document.createElement("button");
    choose.type = "button";
    choose.classList.add("btn", "btn-outline-primary", "btn-sm");
    choose.textContent = "Escolher";
    choose.addEventListener("click", () => onChoose(user));

    item.append(details, choose);
    list.append(item);
  });

  container.append(list);
}
