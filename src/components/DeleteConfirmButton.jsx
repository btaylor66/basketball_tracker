import React from 'react'
import { TIMEOUTS } from '../utils/constants'

export default function DeleteConfirmButton ({ id, deleteConfirmId, setDeleteConfirmId, onDelete, variant = 'default' }) {
  const isConfirming = deleteConfirmId === id

  const handleClick = (e) => {
    e.stopPropagation()
    if (isConfirming) {
      onDelete()
    } else {
      setDeleteConfirmId(id)
      setTimeout(() => setDeleteConfirmId(null), TIMEOUTS.DELETE_CONFIRM)
    }
  }

  const baseStyles = isConfirming ? 'bg-red-600 text-white' : 'text-red-600'
  const variantStyles = variant === 'flex'
    ? `flex-1 py-2 text-xs border-l ${baseStyles} ${!isConfirming ? 'hover:bg-red-50' : ''}`
    : `px-4 py-3 text-sm ${baseStyles}`

  return (
    <button onClick={handleClick} className={variantStyles}>
      {isConfirming ? 'Confirm?' : 'Delete'}
    </button>
  )
}
