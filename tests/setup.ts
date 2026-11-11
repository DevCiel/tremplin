if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal ??= function (): void {
    this.setAttribute('open', '')
  }

  HTMLDialogElement.prototype.show ??= function (): void {
    this.setAttribute('open', '')
  }

  HTMLDialogElement.prototype.close ??= function (): void {
    this.removeAttribute('open')
  }
}
