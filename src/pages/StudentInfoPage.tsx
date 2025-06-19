import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Hash, GraduationCap, Clock, Calendar, 
  Check, Upload, Eye, Glasses, 
  Sun, Square, AlertCircle, CheckCircle2, Trash2
} from 'lucide-react'

interface ImageAnalysis {
  headPosition: boolean
  eyesOpen: boolean
  glasses: boolean
  whiteBackground: boolean
  goodLighting: boolean
}

const StudentInfoPage = () => {
  //const location = useLocation()
  const navigate = useNavigate()
  //const { accessToken,refreshToken,studentName, examCode } = location.state || {}

  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const studentName = localStorage.getItem("studentName");
  const examCode = localStorage.getItem("examCode");
  const [birthYear, setBirthYear] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [inputMethod, setInputMethod] = useState<'manual' | 'calendar'>('manual')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null)
  const [analyzingImage, setAnalyzingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [studentInfo, setStudentInfo] = useState<{
        name: string
        examNumber: number
        section: string
        studyType: string
    } | null>(null)
    const [fetchingInfo, setFetchingInfo] = useState(false)
    useEffect(() => {
        if (!accessToken || !examCode) {
            navigate('/')
            return;
        }

        const fetchStudentInfo = async () => {
            setFetchingInfo(true)
            const url = `/student/search?query=${examCode}`
            try {

                //const encodedName = encodeURIComponent(studentName.trim())  
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                if (!response.ok) throw new Error('Fetch failed')

                const data = await response.json()

                setStudentInfo({
                    name: data.name,
                    examNumber: data.examNumber,
                    section: data.section,
                    studyType: data.studyType
                })
            } catch (err) {
                console.error('❌ Error loading student info:', err)
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

    // Simulate image analysis
    setTimeout(() => {
      const analysis: ImageAnalysis = {
        headPosition: Math.random() > 0.1, //0.3
        eyesOpen: Math.random() > 0.1, //0.2
        glasses: Math.random() > 0.1, //0.5
        whiteBackground: Math.random() > 0.1, //0.4
        goodLighting: Math.random() > 0.1 //0.3
      }
      setImageAnalysis(analysis)
      setAnalyzingImage(false)
    }, 2000)
  }

  const handleDateChange = (date: string) => {
    setBirthDate(date)
      if (date) {
          const year = new Date(date).getFullYear()
      setBirthYear(year.toString())
    }
  }

  const handleYearChange = (year: string) => {
    setBirthYear(year)
    // Clear calendar date when manually entering year
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

    if (!yearValid) return false

    return Object.values(imageAnalysis).every(result => result === true)
  }

    const handleSubmit = async () => {
        if (!isFormValid() || !selectedImage) {
            alert("❌ Please select an image and ensure analysis passed.");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            const birthYearValue =
                inputMethod === "calendar"
                    ? new Date(birthDate).getFullYear().toString()
                    : birthYear;

            formData.append("birthDate", birthYearValue);
            formData.append("image", selectedImage); // This must be a File object

            const response = await fetch(`/student/${examCode}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    // ❌ DO NOT manually set Content-Type when using FormData
                },
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to submit");

            const result = await response.json();
            console.log("✅ Submission Success:", result);
            alert("✅ تم إرسال المعلومات بنجاح!");
            navigate("/");
        } catch (err) {
            console.error("❌ Submission failed:", err);
            alert("فشل إرسال المعلومات. تحقق من الاتصال أو حاول مرة أخرى.");
        } finally {
            setSubmitting(false);
        }

    };



  const renderAnalysisItem = (
    label: string,
    result: boolean,
    icon: React.ReactNode,
    description: string
  ) => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200"
    >
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
        result ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {result ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {result ? 'صالح' : 'غير صالح'}
        </span>
      </div>
      <div className="flex items-center space-x-3 space-x-reverse">
        <div>
          <p className="font-medium text-gray-800 text-right">{label}</p>
          <p className="text-sm text-gray-600 text-right">{description}</p>
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 text-right">معلومات الطالب</h1>
            <p className="text-gray-600 text-right">أكمل ملفك الشخصي لتقديم الحصول على الهوية الجامعية</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Right Column */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Student Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-right">تفاصيل الطالب</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 space-x-reverse p-3 bg-white/50 rounded-xl">
                                  <User className="w-5 h-5 text-gray-500" />
                                  <div className="text-right">
                                      <p className="text-sm text-gray-600">اسم الطالب</p>
                                      <p className="font-semibold text-gray-800">
                                          {fetchingInfo
                                              ? '...جاري التحميل'
                                              : studentInfo?.name
                                                  ? studentInfo.name
                                                  : '---'}
                                      </p>
                  </div>
                  
                </div>

                <div className="flex items-center space-x-3 space-x-reverse p-3 bg-white/50 rounded-xl">
                                  <Hash className="w-5 h-5 text-gray-500" />
                                  <div className="text-right">
                                      <p className="text-sm text-gray-600">الرقم الامتحاني</p>
                                      <p className="font-semibold text-gray-800">
                                          {fetchingInfo
                                              ? '...جاري التحميل'
                                              : studentInfo?.examNumber
                                                  ? studentInfo.examNumber
                                                  : '---'}
                                      </p>

                  </div>
                  
                </div>

                <div className="flex items-center space-x-3 space-x-reverse p-3 bg-white/50 rounded-xl">
                                  <GraduationCap className="w-5 h-5 text-gray-500" />
                                  <div className="text-right">
                                      <p className="text-sm text-gray-600">القسم</p>
                                      <p className="font-semibold text-gray-800">
                                          {fetchingInfo
                                              ? '...جاري التحميل'
                                              : studentInfo?.section
                                                  ? studentInfo.section
                                                  : '---'}
                                      </p>

                  </div>
                  
                </div>

                <div className="flex items-center space-x-3 space-x-reverse p-3 bg-white/50 rounded-xl">
                                  <Clock className="w-5 h-5 text-gray-500" />
                                  <div className="text-right">
                                      <p className="text-sm text-gray-600">نوع الدراسة</p>
                                      <p className="font-semibold text-gray-800">
                                          {fetchingInfo
                                              ? '...جاري التحميل'
                                              : studentInfo?.studyType
                                                  ? studentInfo.studyType
                                                  : '---'}
                                      </p>

                  </div>
                  
                </div>
              </div>
            </motion.div>

            {/* Birth Year */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
                          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-right">تاريخ الميلاد</h2>
                      
              
              {/* Input Method Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                <button
                  onClick={() => setInputMethod('calendar')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    inputMethod === 'calendar' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  التقويم
                </button>
                <button
                  onClick={() => setInputMethod('manual')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    inputMethod === 'manual' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  يدوي
                </button>
              </div>

              {inputMethod === 'manual' ? (
                <div className="flex items-center space-x-3 space-x-reverse p-4 bg-white/50 rounded-xl">
                  <div className="flex-1 text-right">
                    <p className="text-sm text-gray-600 mb-2">سنة الميلاد يجب ان تكون بين (1970-2011)</p>
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <button
                        onClick={() => handleYearChange(Math.min(2011, parseInt(birthYear || '1999') + 1).toString())}
                        disabled={parseInt(birthYear) >= 2011}
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg flex items-center justify-center font-bold transition-colors"
                      >
                        +
                      </button>
                      
                      <div className="flex-1 text-center">
                        <div className="bg-white/80 rounded-lg py-3 px-4 border border-gray-200">
                          <span className="text-2xl font-bold text-gray-800">
                            {birthYear || '----'}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleYearChange(Math.max(1970, parseInt(birthYear || '2000') - 1).toString())}
                        disabled={parseInt(birthYear) <= 1970}
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg flex items-center justify-center font-bold transition-colors"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 space-x-reverse p-4 bg-white/50 rounded-xl">
                                      <div className="flex-1">
                                          <Calendar className="w-5 h-5 text-gray-500" />
                                          <p className="text-sm text-gray-600 mb-2 text-right">اختر تاريخ الميلاد ويجب ان يكون بين (1970-2011)</p>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min="1980-01-01"
                      max="2011-12-31"
                      className="input-field text-left"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Left Column */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Photo Upload */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-right">رفع الصورة</h2>
              
              <div className="space-y-4">
                {!selectedImage ? (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-blue-50/50">
                      <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                      <p className="text-blue-600 font-semibold mb-2">
                        رفع الصورة
                      </p>
                      <p className="text-sm text-gray-600">
                        انقر لاختيار ملف الصورة
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview!} 
                        alt="معاينة" 
                        className="w-32 h-32 object-cover rounded-xl mx-auto border-4 border-white shadow-lg"
                      />
                      <button
                        onClick={handleImageRemove}
                        className="absolute -top-2 -right-2 btn-danger p-2 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-green-600 font-medium mt-2">الصورة المراد رفعها</p>
                  </div>
                )}

                {analyzingImage && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center space-x-3 space-x-reverse py-8"
                  >
                    <p className="text-blue-600 font-medium">جاري تحليل الصورة...</p>
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </motion.div>
                )}

                <AnimatePresence>
                  {imageAnalysis && !analyzingImage && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <h3 className="font-semibold text-gray-800 mb-4 text-right">نتائج التحليل</h3>
                      
                      {renderAnalysisItem(
                        'وضعية الرأس',
                        imageAnalysis.headPosition,
                        <User className="w-5 h-5 text-gray-600" />,
                        'يجب أن يكون الرأس في وسط الإطار'
                      )}
                      
                      {renderAnalysisItem(
                        'العينان مفتوحتان',
                        imageAnalysis.eyesOpen,
                        <Eye className="w-5 h-5 text-gray-600" />,
                        'يجب أن تكون العينان مرئيتان بوضوح'
                      )}
                      
                      {renderAnalysisItem(
                        'فحص النظارات',
                        imageAnalysis.glasses,
                        <Glasses className="w-5 h-5 text-gray-600" />,
                        'لا يُسمح بالنظارات العاكسة'
                      )}
                      
                      {renderAnalysisItem(
                        'الخلفية',
                        imageAnalysis.whiteBackground,
                        <Square className="w-5 h-5 text-gray-600" />,
                        'مطلوب خلفية بيضاء عادية'
                      )}
                      
                      {renderAnalysisItem(
                        'الإضاءة',
                        imageAnalysis.goodLighting,
                        <Sun className="w-5 h-5 text-gray-600" />,
                        'إضاءة جيدة بدون ظلال'
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={handleSubmit}
                disabled={!isFormValid() || submitting}
                className="btn-primary w-full flex items-center justify-center space-x-2 space-x-reverse py-4"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>إرسال المعلومات</span>
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>

              {!isFormValid() && ((inputMethod === 'manual' && birthYear) || (inputMethod === 'calendar' && birthDate)) && selectedImage && imageAnalysis && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-sm text-center mt-3"
                >
                  يرجى التأكد من أن جميع نتائج تحليل الصورة صالحة قبل الإرسال
                </motion.p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentInfoPage