import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';


interface Task {
  id: number;
  val: string;
  done: boolean;
}

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
  constructor() { };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})

export class App {
  currAdd: string = "";
  searchPrefix: string = "";
  currId: number = 0;
  currList: Task[] = []
  lru: LRU<Task> = new LRU(3);
  trie: Trie = new Trie();

  AddTask(word: string): void {
    if (!this.currAdd) return;
    const task: Task = { id: this.currId++, val: word, done: false }
    this.currList.push(task);
    this.currAdd = "";
    this.lru.access(task);
    this.trie.insert(word);

  }

  toggleTask(task: Task): void {
    task.done = !task.done;
    this.lru.access(task);
  }

  get searchTask(): string[] {
    return this.trie.search(this.searchPrefix);
  }

  AddManyTasks(count: number) {
    for (let i = 0; i < count; i++) {
      const randomWord = this.randomWord(5 + Math.floor(Math.random() * 10));
      const task: Task = { id: this.currId++, val: randomWord, done: Math.random() < 0.5 };
      this.currList.push(task);
      this.trie.insert(task.val);
      // Optionally update LRU for some tasks
      if (Math.random() < 0.01) this.lru.access(task);
    }
  }

  randomWord(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let str = '';
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
  }






}

class LRU<T> {
  private list: T[] = [];
  max: number;
  constructor(max: number) { this.max = max; };

  access(item: T): void {
    this.list = this.list.filter(i => i != item);
    this.list.unshift(item);
    if (this.list.length > this.max) {
      this.list = this.list.slice(0, this.max);
    }
  }

  getLRU(): T[] {
    return this.list;
  }
}

class Trie {
  root: TrieNode = new TrieNode();

  insert(word: string): void {
    let curr = this.root;
    for (let i = 0; i < word.length; i++) {
      if (!curr.children.has(word[i])) curr.children.set(word[i], new TrieNode());
      curr = curr.children.get(word[i])!;
    }
    curr.isEndOfWord = true;
  }

  search(prefix: string): string[] {
    const res: string[] = [];
    let curr = this.root;
    for (let i = 0; i < prefix.length; i++) {
      if (!curr.children.has(prefix[i])) return [];
      curr = curr.children.get(prefix[i])!;
    }

    return this.collectAll(curr, prefix);
  }

  collectAll(node: TrieNode, prefix: string): string[] {
    const res: string[] = [];
    if (node.isEndOfWord) res.push(prefix);
    for (let [c, children] of node.children) {
      res.push(...this.collectAll(children, prefix + c));
    }
    return res;
  }
}
