import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Target,
  Plus,
  Clock,
  CircleCheck,
  Trash2,
  Lightbulb,
  ListFilter,
  Award,
  BarChart3,
  Sparkles,
} from "lucide-react";

import "./App.css";

type Task = {
  id: number;
  title: string;
  category: string;
  time: string;
  completed: boolean;
  priority: "Alta" | "Média" | "Baixa";
};

type TaskFilter = "Todas" | "Pendentes" | "Concluídas";

const achievementMilestones = [
  { id: "first-task", title: "Primeiro passo", description: "Conclua sua primeira tarefa.", target: 1 },
  { id: "five-tasks", title: "Ganhando ritmo", description: "Conclua 5 tarefas no total.", target: 5 },
  { id: "ten-tasks", title: "Consistência", description: "Conclua 10 tarefas no total.", target: 10 },
];


function App() {
 const [tasks, setTasks] = useState<Task[]>(() => {
  const savedTasks = localStorage.getItem("eixo-tasks");

  if (savedTasks) {
    try {
      const parsedTasks: unknown = JSON.parse(savedTasks);

      if (Array.isArray(parsedTasks)) {
        return parsedTasks
          .filter((task): task is Task =>
            task !== null && typeof task === "object" &&
            typeof task.id === "number" && typeof task.title === "string" &&
            typeof task.category === "string" && typeof task.time === "string" &&
            typeof task.completed === "boolean",
          )
          .map((task) => ({
            ...task,
            priority: task.priority === "Alta" || task.priority === "Baixa" || task.priority === "Média"
              ? task.priority
              : "Média",
          }));
      }

      localStorage.removeItem("eixo-tasks");
    } catch {
      localStorage.removeItem("eixo-tasks");
    }
  }

  return [
    {
      id: 1,
      title: "Estudar Java",
      category: "Estudos",
      time: "09:00",
      completed: false,
      priority: "Alta",
    },
    {
      id: 2,
      title: "Revisar atividades da faculdade",
      category: "Faculdade",
      time: "10:00",
      completed: false,
      priority: "Média",
    },
    {
      id: 3,
      title: "Organizar tarefas da semana",
      category: "Pessoal",
      time: "11:00",
      completed: true,
      priority: "Baixa",
    },
  ];
});

  const [newTask, setNewTask] = useState("");
  const [newCategory, setNewCategory] = useState("Pessoal");
  const [newTime, setNewTime] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("Média");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("Todas");
  const [totalCompletions, setTotalCompletions] = useState(() => {
    const savedTotal = Number(localStorage.getItem("eixo-total-completions"));
    let alreadyCompleted = 0;

    try {
      const savedTasks: unknown = JSON.parse(localStorage.getItem("eixo-tasks") ?? "[]");
      if (Array.isArray(savedTasks)) {
        alreadyCompleted = savedTasks.filter((task) => task && typeof task === "object" && task.completed === true).length;
      }
    } catch {
      alreadyCompleted = 0;
    }

    return Math.max(Number.isFinite(savedTotal) ? savedTotal : 0, alreadyCompleted);
  });

  function addTask() {
    const title = newTask.trim();

    if (!title) return;

    const task: Task = {
      id: Date.now(),
      title,
      category: newCategory,
      time: newTime || "Sem horário",
      completed: false,
      priority: newPriority,
    };

    setTasks((current) => [...current, task]);
    setNewTask("");
    setNewTime("");
  }

  useEffect(() => {
  localStorage.setItem("eixo-tasks", JSON.stringify(tasks));
}, [tasks]);

  useEffect(() => {
    localStorage.setItem("eixo-total-completions", String(totalCompletions));
  }, [totalCompletions]);

  function toggleTask(id: number) {
    const taskToToggle = tasks.find((task) => task.id === id);

    if (taskToToggle && !taskToToggle.completed) {
      setTotalCompletions((current) => current + 1);
    }

    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task,
      ),
    );
  }

  function deleteTask(id: number) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  const completedTasks = tasks.filter((task) => task.completed).length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedTasks / tasks.length) * 100);

  const visibleTasks = tasks.filter((task) =>
    taskFilter === "Todas" || (taskFilter === "Pendentes" && !task.completed) ||
    (taskFilter === "Concluídas" && task.completed),
  );

  const categoryTotals = tasks.reduce<Record<string, number>>((totals, task) => {
    totals[task.category] = (totals[task.category] ?? 0) + 1;
    return totals;
  }, {});
  const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxCategoryTasks = Math.max(1, ...categories.map(([, total]) => total));
  const unlockedAchievements = achievementMilestones.filter((item) => totalCompletions >= item.target).length;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">e</div>
          <span>eixo</span>
        </div>

        <p className="section-label">ESPAÇO PESSOAL</p>

        <nav className="navigation">
          <a className="nav-item active" href="#inicio">
            <LayoutDashboard size={19} />
            Visão geral
          </a>

          <a className="nav-item" href="#agenda">
            <CalendarDays size={19} />
            Agenda
          </a>

          <a className="nav-item" href="#tarefas">
            <CheckSquare size={19} />
            Tarefas
          </a>

          <a className="nav-item" href="#metas">
            <Target size={19} />
            Minhas metas
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="avatar">E</div>
          <div>
            <strong>Meu espaço</strong>
            <p>Plano pessoal</p>
          </div>
        </div>
      </aside>

      <main className="main-content" id="inicio">
        <header className="topbar">
          <span>Meu espaço / Visão geral</span>
          <span className="today-label">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date())}</span>
        </header>

        <div className="dashboard">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">SEU ESPAÇO, SEU RITMO</p>
              <h1>Vamos avançar um passo de cada vez.</h1>
              <p className="subtitle">
                Organize seu dia e mantenha o foco no que importa.
              </p>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-title">
                <span>Tarefas concluídas</span>
                <CircleCheck size={19} />
              </div>

              <h2>
                {completedTasks}
                <span> / {tasks.length}</span>
              </h2>

              <div className="progress-track">
                <div
                  className="progress-fill purple"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p>{progress}% das tarefas concluídas</p>
            </article>

            <article className="stat-card">
              <div className="stat-title">
                <span>Tarefas pendentes</span>
                <Clock size={19} />
              </div>

              <h2>{tasks.length - completedTasks}</h2>
              <p>Atividades para resolver</p>
            </article>

            <article className="stat-card">
              <div className="stat-title">
                <span>Metas</span>
                <Target size={19} />
              </div>

              <h2>3</h2>
              <p>Objetivos em andamento</p>
            </article>
          </section>

          <section className="insights-grid" aria-label="Painel de progresso e conquistas">
            <article className="panel insight-panel">
              <div className="panel-heading">
                <div><h2>Seu panorama</h2><p>Tarefas atuais por categoria</p></div>
                <BarChart3 size={20} />
              </div>
              {categories.length > 0 ? (
                <div className="category-chart">
                  {categories.map(([category, total]) => (
                    <div className="category-row" key={category}>
                      <span>{category}</span>
                      <div className="category-track" role="img" aria-label={`${total} tarefas em ${category}`}>
                        <div className="category-fill" style={{ width: `${(total / maxCategoryTasks) * 100}%` }} />
                      </div>
                      <strong>{total}</strong>
                    </div>
                  ))}
                </div>
              ) : <p className="empty-state">Adicione tarefas para visualizar suas categorias.</p>}
              <p className="chart-note">Este gráfico mostra suas tarefas atuais; ainda não é um histórico semanal.</p>
            </article>

            <article className="panel achievement-panel">
              <div className="panel-heading">
                <div><h2>Conquistas</h2><p>{unlockedAchievements} de {achievementMilestones.length} desbloqueadas</p></div>
                <Award size={20} />
              </div>
              <div className="achievement-list">
                {achievementMilestones.map((achievement) => {
                  const unlocked = totalCompletions >= achievement.target;
                  const achievementProgress = Math.min(100, Math.round((totalCompletions / achievement.target) * 100));

                  return (
                    <div className={`achievement-item ${unlocked ? "unlocked" : "locked"}`} key={achievement.id}>
                      <div className="achievement-icon"><Sparkles size={17} /></div>
                      <div className="achievement-copy">
                        <strong>{achievement.title}</strong>
                        <span>{unlocked ? "Desbloqueada" : achievement.description}</span>
                        {!unlocked && <div className="achievement-track"><div style={{ width: `${achievementProgress}%` }} /></div>}
                      </div>
                      <span className="achievement-count">{Math.min(totalCompletions, achievement.target)}/{achievement.target}</span>
                    </div>
                  );
                })}
              </div>
              <p className="chart-note">Cada tarefa conta uma vez quando você a conclui; desmarcar não apaga a conquista.</p>
            </article>
          </section>

          <div className="content-grid">
            <section className="panel" id="agenda">
              <div className="panel-heading">
                <div>
                  <h2>Minha agenda</h2>
                  <p>Suas atividades planejadas</p>
                </div>

                <CalendarDays size={20} />
              </div>

              <div className="task-form">
                <input
                  type="text"
                  placeholder="O que você precisa fazer?"
                  value={newTask}
                  onChange={(event) => setNewTask(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addTask();
                  }}
                />

                <button onClick={addTask} aria-label="Adicionar tarefa">
                  <Plus size={19} />
                </button>
              </div>

              <div className="task-options">
                <select aria-label="Categoria da tarefa" value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>
                  <option>Pessoal</option><option>Estudos</option><option>Trabalho</option><option>Saúde</option><option>Finanças</option>
                </select>
                <input aria-label="Horário da tarefa" type="time" value={newTime} onChange={(event) => setNewTime(event.target.value)} />
                <select aria-label="Prioridade da tarefa" value={newPriority} onChange={(event) => setNewPriority(event.target.value as Task["priority"])}>
                  <option>Alta</option><option>Média</option><option>Baixa</option>
                </select>
              </div>

              <div className="task-filter" aria-label="Filtrar tarefas">
                <ListFilter size={15} />
                {(["Todas", "Pendentes", "Concluídas"] as TaskFilter[]).map((filter) => (
                  <button key={filter} className={taskFilter === filter ? "selected" : ""} onClick={() => setTaskFilter(filter)}>{filter}</button>
                ))}
              </div>

              <div className="task-list" id="tarefas">
                {visibleTasks.map((task) => (
                  <article className="task-item" key={task.id}>
                    <button
                      className={`task-check ${
                        task.completed ? "checked" : ""
                      }`}
                      onClick={() => toggleTask(task.id)}
                      aria-label={
                        task.completed
                          ? "Marcar como pendente"
                          : "Concluir tarefa"
                      }
                    >
                      {task.completed && <CircleCheck size={17} />}
                    </button>

                    <div className="task-details">
                      <strong
                        className={task.completed ? "completed" : ""}
                      >
                        {task.title}
                      </strong>

                      <span>
                        {task.category} · {task.time} · <span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      </span>
                    </div>

                    <button
                      className="delete-button"
                      onClick={() => deleteTask(task.id)}
                      aria-label={`Excluir ${task.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                ))}

                {visibleTasks.length === 0 && (
                  <p className="empty-state">
                    {tasks.length === 0 ? "Nenhuma tarefa por aqui. Adicione sua primeira atividade!" : "Nenhuma tarefa corresponde a este filtro."}
                  </p>
                )}
              </div>
            </section>

            <section className="learning-card">
              <div className="learning-icon"><Lightbulb size={19} /></div>
              <div>
                <p className="eyebrow">APRENDER ORGANIZANDO</p>
                <h2>Escolha uma prioridade para hoje</h2>
                <p>Quando tudo parece urgente, selecione uma tarefa importante e comece por ela. Isso reduz a sobrecarga e ajuda a transformar intenção em ação.</p>
                <span className="learning-source">Dica prática · Priorizar antes de preencher o dia</span>
              </div>
            </section>

            <section className="panel" id="metas">
              <div className="panel-heading">
                <div>
                  <h2>Minhas metas</h2>
                  <p>O que você quer conquistar</p>
                </div>

                <Target size={20} />
              </div>

              <div className="goal-item">
                <div className="goal-heading">
                  <strong>Conseguir um estágio em TI</strong>
                  <span>35%</span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill purple"
                    style={{ width: "35%" }}
                  />
                </div>
              </div>

              <div className="goal-item">
                <div className="goal-heading">
                  <strong>Evoluir em Java</strong>
                  <span>60%</span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill blue"
                    style={{ width: "60%" }}
                  />
                </div>
              </div>

              <div className="goal-item">
                <div className="goal-heading">
                  <strong>Organizar as finanças</strong>
                  <span>20%</span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill green"
                    style={{ width: "20%" }}
                  />
                </div>
              </div>
            </section>
          </div>

          <footer className="footer">
            Eixo — Seu progresso, no seu ritmo.
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
