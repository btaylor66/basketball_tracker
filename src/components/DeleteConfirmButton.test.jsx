/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import DeleteConfirmButton from './DeleteConfirmButton'

expect.extend(matchers)

describe('DeleteConfirmButton', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  test('renders Delete button initially', () => {
    render(
      <DeleteConfirmButton
        id={1}
        deleteConfirmId={null}
        setDeleteConfirmId={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  test('shows Confirm? when clicked', () => {
    const setDeleteConfirmId = vi.fn()
    render(
      <DeleteConfirmButton
        id={1}
        deleteConfirmId={null}
        setDeleteConfirmId={setDeleteConfirmId}
        onDelete={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText('Delete'))
    expect(setDeleteConfirmId).toHaveBeenCalledWith(1)
  })

  test('calls onDelete when confirming', () => {
    const onDelete = vi.fn()
    render(
      <DeleteConfirmButton
        id={1}
        deleteConfirmId={1}
        setDeleteConfirmId={vi.fn()}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText('Confirm?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Confirm?'))
    expect(onDelete).toHaveBeenCalled()
  })

  test('stops event propagation on click', () => {
    const parentClick = vi.fn()
    const { container } = render(
      <div onClick={parentClick}>
        <DeleteConfirmButton
          id={1}
          deleteConfirmId={null}
          setDeleteConfirmId={vi.fn()}
          onDelete={vi.fn()}
        />
      </div>
    )

    fireEvent.click(screen.getByText('Delete'))
    expect(parentClick).not.toHaveBeenCalled()
  })

  test('applies flex variant styles', () => {
    render(
      <DeleteConfirmButton
        id={1}
        deleteConfirmId={null}
        setDeleteConfirmId={vi.fn()}
        onDelete={vi.fn()}
        variant="flex"
      />
    )

    const button = screen.getByText('Delete')
    expect(button.className).toContain('flex-1')
    expect(button.className).toContain('border-l')
  })

  test('applies default variant styles', () => {
    render(
      <DeleteConfirmButton
        id={1}
        deleteConfirmId={null}
        setDeleteConfirmId={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    const button = screen.getByText('Delete')
    expect(button.className).toContain('px-4')
    expect(button.className).toContain('py-3')
  })
})
