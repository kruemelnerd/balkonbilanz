import { mkdtempSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Window } from 'happy-dom';
import { parse, compileScript } from '@vue/compiler-sfc';

const compiledCache = new Map<string, Promise<string>>();
const vueHarnessTmpDir = mkdtempSync(join(process.cwd(), '.planning', 'tmp-vue-'));

function writeFileAtomic(filePath: string, contents: string) {
  const tempPath = `${filePath}.${process.pid}.${Math.random().toString(16).slice(2)}.tmp`;
  writeFileSync(tempPath, contents, 'utf8');
  renameSync(tempPath, filePath);
}

function installDom(): Window {
  const window = new Window({ url: 'http://localhost/' });
  const globals: Record<string, unknown> = {
    window,
    document: window.document,
    Document: window.Document,
    ShadowRoot: window.ShadowRoot,
    navigator: window.navigator,
    location: window.location,
    history: window.history,
    Element: window.Element,
    HTMLElement: window.HTMLElement,
    HTMLButtonElement: window.HTMLButtonElement,
    HTMLFormElement: window.HTMLFormElement,
    HTMLInputElement: window.HTMLInputElement,
    HTMLTextAreaElement: window.HTMLTextAreaElement,
    ShadowRoot: window.ShadowRoot,
    SVGElement: window.SVGElement,
    Node: window.Node,
    Event: window.Event,
    CustomEvent: window.CustomEvent,
    MouseEvent: window.MouseEvent,
    KeyboardEvent: window.KeyboardEvent,
    location: window.location,
    history: window.history,
    getComputedStyle: window.getComputedStyle.bind(window),
  };

  for (const [key, value] of Object.entries(globals)) {
    Reflect.set(globalThis, key, value);
  }

  return window;
}

async function compileVueModule(filePath: string): Promise<string> {
  const source = readFileSync(filePath, 'utf8');
  const hash = createHash('sha256').update(filePath).update(source).digest('hex').slice(0, 12);
  const cacheKey = `${filePath}:${hash}`;

  const cached = compiledCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const { descriptor } = parse(source, { filename: filePath });
    const script = compileScript(descriptor, { id: hash, inlineTemplate: true });
    let code = script.content;
    code = code.replace(/^import type .*?;\n?/gm, '');

    const importPattern = /from\s+['"]([^'"]+\.(?:vue|ts))['"]/g;
    const replacements: Array<{ start: number; end: number; replacement: string }> = [];
    let match: RegExpExecArray | null;

    while ((match = importPattern.exec(code))) {
      const importedPath = resolve(dirname(filePath), match[1]);
      const importedUrl = match[1].endsWith('.vue')
        ? await compileVueModule(importedPath)
        : pathToFileURL(importedPath).href;
      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        replacement: `from ${JSON.stringify(importedUrl)}`,
      });
    }

    if (replacements.length > 0) {
      for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
        code = `${code.slice(0, replacement.start)}${replacement.replacement}${code.slice(replacement.end)}`;
      }
    }

    const outDir = vueHarnessTmpDir;
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, `${hash}.ts`);
    writeFileAtomic(outPath, code);
    return pathToFileURL(outPath).href;
  })();

  compiledCache.set(cacheKey, promise);
  return promise;
}

export async function loadVueComponent(filePath: string): Promise<any> {
  const moduleUrl = await compileVueModule(filePath);
  const mod = await import(`${moduleUrl}?v=${Date.now()}`);
  return mod.default ?? mod;
}

export async function mountVueComponent(
  filePath: string,
  props: Record<string, unknown> = {},
  options: { plugins?: Array<unknown | (() => Promise<unknown> | unknown)> } = {},
) {
  const window = installDom();
  const { createApp, reactive, nextTick } = await import('vue');
  const Component = await loadVueComponent(filePath);
  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  const app = createApp(Component, reactive(props));

  for (const plugin of options.plugins ?? []) {
    const resolved = typeof plugin === 'function' ? await plugin() : plugin;
    app.use(resolved as any);
  }

  app.mount(container);
  await nextTick();

  return {
    app,
    container,
    window,
    props: reactiveProps,
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

export async function flush() {
  const { nextTick } = await import('vue');
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Promise.resolve();
  await nextTick();
}

export function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
}

export function clickElement(element: HTMLElement) {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

export { installDom };
export function getVueHarnessTmpDir() {
  return vueHarnessTmpDir;
}
