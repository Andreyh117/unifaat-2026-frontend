import { userSearchApi } from "../api/userSearchApi";
import { taskCreateApi } from "../api/taskCreateApi";
import userSearchResultsRender from "../render/userSearchResultsRender";
import tasksListRender from "../render/tasksListRender";
import type { User, UserSearchFilters } from "../types/api";

type SearchField = "name" | "email" | "job_title" | "city" | "state" | "bio";

const searchFields: SearchField[] = ["name", "email", "job_title", "city", "state", "bio"];

export default function assignTaskModalListeners(idUser: number): void {
  const modal = document.querySelector<HTMLElement>("#assign-task-modal");
  const nameInput = document.querySelector<HTMLInputElement>("#assign-task-name");
  const searchForm = document.querySelector<HTMLFormElement>("#assign-search-form");
  const fieldInput = document.querySelector<HTMLSelectElement>("#assign-search-field");
  const valueInput = document.querySelector<HTMLInputElement>("#assign-search-value");
  const results = document.querySelector<HTMLElement>("#assign-search-results");
  const selectedDisplay = document.querySelector<HTMLElement>("#assign-selected-user");
  const errorDisplay = document.querySelector<HTMLElement>("#assign-task-error");
  const feedback = document.querySelector<HTMLElement>("#assign-task-feedback");
  const submit = document.querySelector<HTMLButtonElement>("#assign-task-submit");

  if (!modal || !nameInput || !searchForm || !fieldInput || !valueInput || !results || !selectedDisplay || !errorDisplay || !feedback || !submit) return;

  let selectedUser: User | null = null;

  function showError(message: string): void {
    errorDisplay!.textContent = message;
    errorDisplay!.classList.remove("d-none");
  }

  function clearError(): void {
    errorDisplay!.textContent = "";
    errorDisplay!.classList.add("d-none");
  }

  function chooseUser(user: User): void {
    selectedUser = user;
    selectedDisplay!.textContent = `Atribuir para: ${user.name} (${user.email})`;
    clearError();
  }

  searchForm.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    clearError();
    selectedUser = null;
    selectedDisplay.textContent = "";
    results.replaceChildren();

    const value = valueInput.value.trim();
    if (!value) {
      showError("Digite algo para buscar");
      return;
    }

    const field = fieldInput.value;
    if (!searchFields.includes(field as SearchField)) {
      showError("Campo de busca inválido");
      return;
    }

    const filters: UserSearchFilters = { [field]: value };

    try {
      const result = await userSearchApi(filters, 1, 10);
      userSearchResultsRender(results, result, chooseUser);
    } catch (error) {
      console.error(error);
      showError("Erro ao buscar usuários");
    }
  });

  submit.addEventListener("click", async () => {
    clearError();
    const name = nameInput.value.trim();

    if (!name) {
      showError("Digite o nome da tarefa");
      return;
    }

    if (!selectedUser) {
      showError("Escolha um usuário");
      return;
    }

    const user = selectedUser;
    submit.disabled = true;

    try {
      await taskCreateApi(user.id, { name });

      if (user.id === idUser) await tasksListRender(idUser);

      feedback.textContent = `Tarefa criada para ${user.name}`;
      feedback.classList.remove("d-none");
      modal.querySelector<HTMLButtonElement>("[data-bs-dismiss='modal']")?.click();
      nameInput.value = "";
      valueInput.value = "";
      results.replaceChildren();
      selectedDisplay.textContent = "";
      selectedUser = null;
    } catch (error) {
      console.error(error);
      showError("Erro ao criar tarefa");
    } finally {
      submit.disabled = false;
    }
  });
}
