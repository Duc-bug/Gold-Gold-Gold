import React, { useState } from 'react'
import { exportToCSV, exportToExcel, exportPortfolioToPDF } from '../../utils/exportHelpers'
import toast from 'react-hot-toast'

const ExportButton = ({ data, filename, type = 'all', profile }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleExport = async (format) => {
        try {
            if (!data || data.length === 0) {
                toast.error('No data to export')
                return
            }

            switch (format) {
                case 'csv':
                    await exportToCSV(data, filename)
                    toast.success('CSV exported successfully!')
                    break
                case 'excel':
                    await exportToExcel(data, filename)
                    toast.success('Excel exported successfully!')
                    break
                case 'pdf':
                    if (type === 'portfolio') {
                        exportPortfolioToPDF(data, profile)
                        toast.success('PDF report generated!')
                    } else {
                        toast.error('PDF export only supported for portfolio currently')
                    }
                    break
                default:
                    break
            }
            setIsOpen(false)
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export data')
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-gold-400 rounded-lg text-sm transition-colors border border-white/5"
            >
                <span>📥</span>
                <span>Export</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-1">
                        <button
                            onClick={() => handleExport('csv')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                        >
                            <span>📄</span> CSV
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                        >
                            <span>📊</span> Excel
                        </button>
                        {type === 'portfolio' && (
                            <button
                                onClick={() => handleExport('pdf')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                            >
                                <span>📑</span> PDF Report
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    )
}

export default ExportButton
