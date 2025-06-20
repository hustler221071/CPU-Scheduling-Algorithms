
import React, { useState } from "react";
import "./App.css";

function App() {
  const [processes, setProcesses] = useState([]);
  const [newProcess, setNewProcess] = useState({ id: "", arrival: "", burst: "", priority: "" });
  const [result, setResult] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProcess({ ...newProcess, [name]: value });
  };

  const addProcess = () => {
    setProcesses([...processes, { ...newProcess, arrival: +newProcess.arrival, burst: +newProcess.burst, priority: +newProcess.priority }]);
    setNewProcess({ id: "", arrival: "", burst: "", priority: "" });
  };

  const cloneProcesses = () => JSON.parse(JSON.stringify(processes));

  const fcfs = () => {
    const sorted = cloneProcesses().sort((a, b) => a.arrival - b.arrival);
    let time = 0;
    const updated = sorted.map(p => {
      const start = Math.max(time, p.arrival);
      const completion = start + p.burst;
      const turnaround = completion - p.arrival;
      const waiting = turnaround - p.burst;
      time = completion;
      return { ...p, completion, turnaround, waiting };
    });
    setResult(updated);
  };

  const sjf = () => {
    const list = cloneProcesses();
    let time = 0, completed = 0;
    const updated = [];
    const n = list.length;
    const executed = Array(n).fill(false);

    while (completed < n) {
      let idx = -1, minBT = Infinity;
      for (let i = 0; i < n; i++) {
        if (!executed[i] && list[i].arrival <= time && list[i].burst < minBT) {
          minBT = list[i].burst;
          idx = i;
        }
      }
      if (idx === -1) {
        time++;
      } else {
        const p = list[idx];
        const completion = time + p.burst;
        const turnaround = completion - p.arrival;
        const waiting = turnaround - p.burst;
        updated.push({ ...p, completion, turnaround, waiting });
        executed[idx] = true;
        time = completion;
        completed++;
      }
    }
    setResult(updated);
  };

  const sjrf = () => {
    const list = cloneProcesses();
    let time = 0, completed = 0;
    const n = list.length;
    const remaining = list.map(p => p.burst);
    const updated = Array(n);
    const finishTime = Array(n).fill(0);

    while (completed < n) {
      let idx = -1, minBT = Infinity;
      for (let i = 0; i < n; i++) {
        if (list[i].arrival <= time && remaining[i] > 0 && remaining[i] < minBT) {
          minBT = remaining[i];
          idx = i;
        }
      }
      if (idx === -1) {
        time++;
      } else {
        remaining[idx]--;
        time++;
        if (remaining[idx] === 0) {
          finishTime[idx] = time;
          const turnaround = time - list[idx].arrival;
          const waiting = turnaround - list[idx].burst;
          updated[idx] = { ...list[idx], completion: time, turnaround, waiting };
          completed++;
        }
      }
    }
    setResult(updated.filter(p => p));
  };

  const lrtf = () => {
    const list = cloneProcesses();
    let time = 0, completed = 0;
    const n = list.length;
    const remaining = list.map(p => p.burst);
    const updated = Array(n);
    const finishTime = Array(n).fill(0);

    while (completed < n) {
      let idx = -1, maxBT = -1;
      for (let i = 0; i < n; i++) {
        if (list[i].arrival <= time && remaining[i] > 0 && remaining[i] > maxBT) {
          maxBT = remaining[i];
          idx = i;
        }
      }
      if (idx === -1) {
        time++;
      } else {
        remaining[idx]--;
        time++;
        if (remaining[idx] === 0) {
          finishTime[idx] = time;
          const turnaround = time - list[idx].arrival;
          const waiting = turnaround - list[idx].burst;
          updated[idx] = { ...list[idx], completion: time, turnaround, waiting };
          completed++;
        }
      }
    }
    setResult(updated.filter(p => p));
  };

  const rr = () => {
    const list = cloneProcesses();
    const tq = parseInt(prompt("Enter Time Quantum"), 10);
    const queue = [];
    const remaining = list.map(p => p.burst);
    const n = list.length;
    const updated = Array(n);
    const finishTime = Array(n).fill(0);
    let time = 0, completed = 0;

    while (completed < n || queue.length > 0) {
      for (let i = 0; i < n; i++) {
        if (list[i].arrival <= time && !queue.includes(i) && remaining[i] > 0) {
          queue.push(i);
        }
      }
      if (queue.length === 0) {
        time++;
        continue;
      }
      const idx = queue.shift();
      const execTime = Math.min(tq, remaining[idx]);
      remaining[idx] -= execTime;
      time += execTime;
      for (let i = 0; i < n; i++) {
        if (list[i].arrival <= time && !queue.includes(i) && remaining[i] > 0 && i !== idx) {
          queue.push(i);
        }
      }
      if (remaining[idx] > 0) {
        queue.push(idx);
      } else if (!updated[idx]) {
        finishTime[idx] = time;
        const turnaround = time - list[idx].arrival;
        const waiting = turnaround - list[idx].burst;
        updated[idx] = { ...list[idx], completion: time, turnaround, waiting };
        completed++;
      }
    }
    setResult(updated.filter(p => p));
  };

  const priority = () => {
    const list = cloneProcesses();
    let time = 0, completed = 0;
    const n = list.length;
    const remaining = list.map(p => p.burst);
    const updated = Array(n);
    const finishTime = Array(n).fill(0);

    while (completed < n) {
      let idx = -1, highest = -1;
      for (let i = 0; i < n; i++) {
        if (list[i].arrival <= time && remaining[i] > 0 && list[i].priority > highest) {
          highest = list[i].priority;
          idx = i;
        }
      }
      if (idx === -1) {
        time++;
      } else {
        remaining[idx]--;
        time++;
        if (remaining[idx] === 0) {
          finishTime[idx] = time;
          const turnaround = time - list[idx].arrival;
          const waiting = turnaround - list[idx].burst;
          updated[idx] = { ...list[idx], completion: time, turnaround, waiting };
          completed++;
        }
      }
    }
    setResult(updated.filter(p => p));
  };

  return (
    <div className="container">
      <h1>CPU Scheduling Simulator</h1>
      <div>
        <input name="id" value={newProcess.id} onChange={handleChange} placeholder="ID" />
        <input name="arrival" value={newProcess.arrival} onChange={handleChange} placeholder="Arrival Time" />
        <input name="burst" value={newProcess.burst} onChange={handleChange} placeholder="Burst Time" />
        <input name="priority" value={newProcess.priority} onChange={handleChange} placeholder="Priority" />
        <button onClick={addProcess}>Add</button>
        <button onClick={fcfs}>FCFS</button>
        <button onClick={sjf}>SJF</button>
        <button onClick={sjrf}>SJRF</button>
        <button onClick={lrtf}>LRTF</button>
        <button onClick={rr}>RR</button>
        <button onClick={priority}>Priority</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Arrival</th>
            <th>Burst</th>
            <th>Priority</th>
            <th>Completion</th>
            <th>Turnaround</th>
            <th>Waiting</th>
          </tr>
        </thead>
        <tbody>
          {result.map((p, i) => (
            <tr key={i}>
              <td>{p.id}</td>
              <td>{p.arrival}</td>
              <td>{p.burst}</td>
              <td>{p.priority}</td>
              <td>{p.completion}</td>
              <td>{p.turnaround}</td>
              <td>{p.waiting}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
