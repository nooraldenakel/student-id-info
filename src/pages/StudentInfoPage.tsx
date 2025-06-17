import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    User, Hash, GraduationCap, Clock, Calendar,
    Check, Upload, Eye, Glasses,
    Sun, Square, AlertCircle, CheckCircle2, Trash2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageAnalysis {
    headPosition: boolean
    eyesOpen: boolean
    glasses: boolean
    whiteBackground: boolean
    goodLighting: boolean
}

const StudentInfoPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { studentName, examCode } = location.state || {}

    const [studentInfo, setStudentInfo] = useState<any>(null)
    const [fetchingInfo, setFetchingInfo] = useState(false)
    const [birthYear, setBirthYear] = useState('')
    const [birthDate, setBirthDate] = useState('')
    const [inputMethod, setInputMethod] = useState<'manual' | 'calendar'>('manual')
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null)
    const [analyzingImage, setAnalyzingImage] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!studentName || !examCode) {
            navigate('/')
            return
        }

        const fetchStudentInfo = async () => {
            setFetchingInfo(true)
            try {
                const encodedName = encodeURIComponent(studentName.trim())
                const res = await fetch(`https://www.alayen-student-info.site/api/student/${examCode}/${encodedName}`)
                if (!res.ok) throw new Error('Failed to fetch student info')
                const data = await res.json()
                setStudentInfo(data)
            } catch (err) {
                console.error('❌ Failed to load student info', err)
                setStudentInfo(null)
            } finally {
                setFetchingInfo(false)
            }
        }

        fetchStudentInfo()
    }, [studentName, examCode, navigate])

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
                analyzeImage()
            }
            reader.readAsDataURL(file)
        }
    }

    const handleImageRemove = () => {
        setSelectedImage(null)
        setImagePreview(null)
        setImageAnalysis(null)
        setAnalyzingImage(false)
    }

    const analyzeImage = () => {
        setAnalyzingImage(true)
        setImageAnalysis(null)
        setTimeout(() => {
            const analysis: ImageAnalysis = {
                headPosition: Math.random() > 0.3,
                eyesOpen: Math.random() > 0.2,
                glasses: Math.random() > 0.5,
                whiteBackground: Math.random() > 0.4,
                goodLighting: Math.random() > 0.3
            }
            setImageAnalysis(analysis)
            setAnalyzingImage(false)
        }, 2000)
    }

    const handleDateChange = (date: string) => {
        setBirthDate(date)
        const year = new Date(date).getFullYear()
        setBirthYear(year.toString())
    }

    const handleYearChange = (year: string) => {
        setBirthYear(year)
        setBirthDate('')
    }

    const isFormValid = () => {
        if (!selectedImage || !imageAnalysis) return false
        let yearValid = false
        if (inputMethod === 'manual') {
            const year = parseInt(birthYear)
            yearValid = year >= 1980 && year <= 2011
        } else {
            yearValid = !!birthDate
        }
        return yearValid && Object.values(imageAnalysis).every(v => v === true)
    }

    const handleSubmit = () => {
        if (!isFormValid()) return
        setSubmitting(true)
        setTimeout(() => {
            setSubmitting(false)
            alert('✅ تم إرسال المعلومات بنجاح')
            navigate('/')
        }, 2000)
    }

    const renderDetail = (icon: React.ReactNode, label: string, value: string | undefined) => (
        <div className="flex items-center space-x-3 space-x-reverse p-3 bg-white/50 rounded-xl">
            {icon}
            <div className="text-right">
                <p className="text-sm text-gray-600">{label}</p>
                <p className="font-semibold text-gray-800">
                    {fetchingInfo ? '...جارٍ التحميل' : value || '---'}
                </p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen p-4 relative overflow-hidden">
            {/* other layout parts... */}

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mb-8">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 text-right">معلومات الطالب</h1>
                        <p className="text-gray-600 text-right">أكمل ملفك الشخصي لتقديم الحصول على الهوية الجامعية</p>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Right column */}
                    <div className="space-y-6 order-1 lg:order-2">
                        <motion.div className="glass-card rounded-2xl p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-right">تفاصيل الطالب</h2>
                            <div className="space-y-4">
                                {renderDetail(<User className="w-5 h-5 text-gray-500" />, 'اسم الطالب', studentName)}
                                {renderDetail(<Hash className="w-5 h-5 text-gray-500" />, 'الرقم الامتحاني', examCode)}
                                {renderDetail(<GraduationCap className="w-5 h-5 text-gray-500" />, 'القسم', studentInfo?.collegeDepartment)}
                                {renderDetail(<Clock className="w-5 h-5 text-gray-500" />, 'نوع الدراسة', studentInfo?.studyType)}
                            </div>
                        </motion.div>

                        {/* birth year + submit button as in your original code... */}
                    </div>

                    {/* Left column – upload + analysis (unchanged from your version) */}
                </div>
            </div>
        </div>
    )
}

export default StudentInfoPage
