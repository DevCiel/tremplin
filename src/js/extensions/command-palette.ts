import { BaseComponent, type ElementLike } from '../../integrations/core-bindings.js'
import EventHandler from '../dom/event-handler.js'
import SelectorEngine from '../dom/selector-engine.js'
import { getElement, onDOMContentLoaded } from '../util/index.js'

// Extension events retain their public CustomEvent.detail payload. The core
// event handler intentionally does not provide this Tremplin-only helper.
function emit<T>(element: HTMLElement, name: string, detail?: T, cancelable = true): CustomEvent<T> {
  const event = new CustomEvent<T>(name, { bubbles: true, cancelable, detail })
  element.dispatchEvent(event)
  return event
}

function focusableChildren(element: HTMLElement): HTMLElement[] {
  return [...element.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
    .filter(item => !item.closest('[hidden], [inert], [aria-hidden="true"]') && item.getAttribute('aria-disabled') !== 'true' && getComputedStyle(item).visibility !== 'hidden' && getComputedStyle(item).display !== 'none')
}

export interface CommandPaletteOptions { shortcut?: boolean; closeOnSelect?: boolean }

let commandId = 0

export class CommandPalette extends BaseComponent {
  static override get NAME(): string { return 'command-palette' }
  static override get Default(): Required<CommandPaletteOptions> { return { shortcut: true, closeOnSelect: true } }
  static override get DefaultType(): Record<string, string> { return { shortcut: 'boolean', closeOnSelect: 'boolean' } }
  private readonly options: Required<CommandPaletteOptions>
  private readonly input: HTMLInputElement
  private readonly list: HTMLElement
  private readonly empty: HTMLElement | null
  private activeIndex = -1
  private opener: HTMLElement | null = null
  private previousOverflow: string | null = null
  private paletteDisposed = false

  constructor(element: ElementLike, options: CommandPaletteOptions = {}) {
    const resolved = getElement(element)
    if (!resolved) throw new TypeError('Tremplin CommandPalette requires an existing element')
    const input = resolved.querySelector<HTMLInputElement>('.command-palette-input')
    if (!input) throw new TypeError('Tremplin CommandPalette requires a .command-palette-input')
    const list = resolved.querySelector<HTMLElement>('.command-palette-list')
    if (!list) throw new TypeError('Tremplin CommandPalette requires a .command-palette-list')
    super(resolved, options)
    this.options = this._config as Required<CommandPaletteOptions>
    this.input = input
    this.list = list
    this.empty = this._element.querySelector<HTMLElement>('.command-palette-empty')
    this._element.setAttribute('role', this._element.getAttribute('role') ?? 'dialog')
    this._element.setAttribute('aria-modal', 'true')
    this._element.setAttribute('aria-hidden', String(this._element.hidden))
    this.input.setAttribute('role', 'combobox')
    this.input.setAttribute('aria-autocomplete', 'list')
    this.input.setAttribute('aria-expanded', 'false')
    if (!this.list.id) this.list.id = `${this._element.id || 'command-palette'}-listbox`
    this.list.setAttribute('role', 'listbox')
    this.input.setAttribute('aria-controls', this.list.id)
    this.prepareCommands()
    this._element.addEventListener('keydown', this.onKeydown)
    this._element.addEventListener('pointerdown', this.onPointerDown)
    this.input.addEventListener('input', this.filter)
    if (this.options.shortcut) document.addEventListener('keydown', this.onShortcut)
  }

  async show(): Promise<void> {
    if (!this._element || this.paletteDisposed || !this._element.hidden || emit(this._element, 'show.trm.command-palette', undefined, true).defaultPrevented) return
    this.opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    this._element.hidden = false
    this._element.classList.add('show')
    this._element.setAttribute('aria-hidden', 'false')
    this.input.setAttribute('aria-expanded', 'true')
    this.previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.addEventListener('keydown', this.onDocumentKeydown)
    this.prepareCommands()
    this.filter()
    this.input.focus()
    emit(this._element, 'shown.trm.command-palette')
  }

  hide = async (): Promise<void> => {
    if (!this._element || this.paletteDisposed || this._element.hidden || emit(this._element, 'hide.trm.command-palette', undefined, true).defaultPrevented) return
    this.close()
    emit(this._element, 'hidden.trm.command-palette')
  }

  private close(): void {
    if (this.previousOverflow !== null) {
      document.documentElement.style.overflow = this.previousOverflow
      this.previousOverflow = null
    }
    document.removeEventListener('keydown', this.onDocumentKeydown)
    this._element.classList.remove('show')
    this._element.hidden = true
    this._element.setAttribute('aria-hidden', 'true')
    this.input.setAttribute('aria-expanded', 'false')
    this.input.removeAttribute('aria-activedescendant')
    this.activeIndex = -1
    this.opener?.focus()
  }

  toggle(): Promise<void> { return this._element.hidden ? this.show() : this.hide() }

  private commands(): HTMLElement[] { return [...this._element.querySelectorAll<HTMLElement>('.command-item')] }
  private isDisabled(command: HTMLElement): boolean { return command.matches(':disabled, [aria-disabled="true"]') }
  private visibleCommands(): HTMLElement[] { return this.commands().filter(command => !command.hidden && !this.isDisabled(command)) }

  private prepareCommands(): void {
    this.commands().forEach(command => {
      command.setAttribute('role', 'option')
      command.setAttribute('aria-selected', 'false')
      if (command.matches(':disabled')) command.setAttribute('aria-disabled', 'true')
    })
    this._element.querySelectorAll<HTMLElement>('.command-group').forEach(group => {
      group.setAttribute('role', 'group')
      const label = group.querySelector<HTMLElement>('.command-group-label')
      if (!label) return
      if (!label.id) label.id = `trm-command-group-${++commandId}`
      group.setAttribute('aria-labelledby', label.id)
    })
  }

  private filter = (): void => {
    const query = this.input.value.trim().toLocaleLowerCase()
    this.prepareCommands()
    this.commands().forEach(command => {
      const haystack = `${command.textContent ?? ''} ${command.dataset.keywords ?? ''}`.toLocaleLowerCase()
      command.hidden = !haystack.includes(query)
      command.classList.remove('active')
    })
    const commands = this.visibleCommands()
    this.activeIndex = commands.length ? 0 : -1
    this.activate(commands[0])
    this._element.querySelectorAll<HTMLElement>('.command-group').forEach(group => {
      group.hidden = ![...group.querySelectorAll<HTMLElement>('.command-item')].some(command => !command.hidden)
    })
    const matches = this.commands().filter(command => !command.hidden).length
    if (this.empty) this.empty.hidden = matches > 0
    emit(this._element, 'filter.trm.command-palette', { query, results: commands.length })
  }

  private activate(command?: HTMLElement): void {
    this.commands().forEach(item => {
      item.classList.toggle('active', item === command)
      item.setAttribute('aria-selected', String(item === command))
    })
    if (command) {
      if (!command.id) command.id = `trm-command-${++commandId}`
      this.input.setAttribute('aria-activedescendant', command.id)
      command.scrollIntoView?.({ block: 'nearest' })
    } else this.input.removeAttribute('aria-activedescendant')
  }

  private select(command?: HTMLElement): void {
    if (!command) return
    const event = emit(this._element, 'select.trm.command-palette', { command, value: command.dataset.value ?? command.textContent?.trim() }, true)
    if (event.defaultPrevented) return
    if (this.options.closeOnSelect) this.hide()
    emit(this._element, 'selected.trm.command-palette', event.detail)
  }

  private onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') { event.preventDefault(); void this.hide(); return }
    const commands = this.visibleCommands()
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (commands.length === 0) return
      this.activeIndex = (this.activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + commands.length) % commands.length
      this.activate(commands[this.activeIndex])
      return
    }
    if (event.key === 'Home') { event.preventDefault(); this.activeIndex = 0; this.activate(commands[0]); return }
    if (event.key === 'End') { event.preventDefault(); this.activeIndex = commands.length - 1; this.activate(commands.at(-1)); return }
    if (event.key === 'Enter' && document.activeElement === this.input) { event.preventDefault(); this.select(commands[this.activeIndex]); return }
    if (event.key === 'Tab') {
      const focusable = focusableChildren(this._element)
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
  }

  private onPointerDown = (event: Event): void => {
    if (event.target === this._element) { this.hide(); return }
    const command = event.target instanceof Element ? event.target.closest<HTMLElement>('.command-item') : null
    if (command && !this.isDisabled(command)) this.select(command)
  }

  private onShortcut = (event: KeyboardEvent): void => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') { event.preventDefault(); this.toggle() }
  }

  private onDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || this._element.hidden) return
    event.preventDefault()
    void this.hide()
  }

  override dispose(): void {
    if (!this._element || this.paletteDisposed) return
    // Teardown cannot be canceled by a hide listener; strict BaseComponent
    // clears own properties, so a second dispose must also be harmless.
    this.close()
    this._element.removeEventListener('keydown', this.onKeydown)
    this._element.removeEventListener('pointerdown', this.onPointerDown)
    this.input.removeEventListener('input', this.filter)
    document.removeEventListener('keydown', this.onShortcut)
    document.removeEventListener('keydown', this.onDocumentKeydown)
    this.paletteDisposed = true
    super.dispose()
  }
}

const initializedRoots = new WeakSet<Document | HTMLElement>()

export function initCommandPalette(root: Document | HTMLElement = document): void {
  if (initializedRoots.has(root)) return
  initializedRoots.add(root)
  root.querySelectorAll<HTMLElement>('[data-trm-command-palette]').forEach(element => CommandPalette.getOrCreateInstance(element))
  EventHandler.on(root, 'click.trm.command-palette.data-api', '[data-trm-toggle="command-palette"], [data-trm-dismiss="command-palette"]', event => {
    const trigger = event.delegateTarget as HTMLElement
    if (trigger.dataset.trmToggle === 'command-palette') {
      const target = SelectorEngine.getElementFromSelector(trigger)
      if (!target) return
      event.preventDefault()
      void CommandPalette.getOrCreateInstance(target).toggle()
      return
    }
    const palette = trigger.closest<HTMLElement>('.command-palette')
    if (palette) void CommandPalette.getOrCreateInstance(palette).hide()
  })
}

if (typeof document !== 'undefined') onDOMContentLoaded(() => initCommandPalette())
