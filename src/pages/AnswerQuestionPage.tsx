import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Question } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Video, Mic, Type, Play, Pause, RotateCcw, Check, FileText } from 'lucide-react';

export function AnswerQuestionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [contentType, setContentType] = useState<'video' | 'audio' | 'text'>('video');
  const [textAnswer, setTextAnswer] = useState('');
  const [teleprompterNotes, setTeleprompterNotes] = useState('');
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(30);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<NodeJS.Timeout>();
  const teleprompterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) loadQuestion();
  }, [id]);

  useEffect(() => {
    let scrollInterval: NodeJS.Timeout;
    if (isRecording && !isPaused && showTeleprompter && teleprompterRef.current) {
      scrollInterval = setInterval(() => {
        if (teleprompterRef.current) {
          teleprompterRef.current.scrollTop += 1;
        }
      }, scrollSpeed);
    }
    return () => clearInterval(scrollInterval);
  }, [isRecording, isPaused, showTeleprompter, scrollSpeed]);

  const loadQuestion = async () => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (data) setQuestion(data);
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const pauseRecording = () => {
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resumeRecording = () => {
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetRecording = () => {
    stopRecording();
    setRecordingTime(0);
  };

  const handleSubmit = async () => {
    if (!question || !user) return;

    setError('');
    setLoading(true);

    try {
      const answerData = {
        question_id: question.id,
        mentor_id: user.id,
        content_type: contentType,
        content_url: contentType === 'text' ? null : 'placeholder-url',
        transcript: contentType === 'text' ? textAnswer : null,
        teleprompter_notes: contentType !== 'text' ? teleprompterNotes : null,
        duration_seconds: contentType !== 'text' ? recordingTime : 0,
        status: 'draft',
      };

      const { error: insertError } = await supabase.from('answers').insert(answerData);

      if (insertError) throw insertError;

      await supabase
        .from('questions')
        .update({ status: 'answered' })
        .eq('id', question.id);

      navigate(`/questions/${question.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!question) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-sm font-medium text-slate-600 mb-2">Answering Question</h2>
          <h1 className="text-2xl font-bold text-slate-900">{question.title}</h1>
          {question.description && (
            <p className="text-slate-600 mt-2">{question.description}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Response Format
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setContentType('video')}
                className={`flex flex-col items-center px-4 py-4 rounded-lg border-2 transition ${
                  contentType === 'video'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <Video className="w-8 h-8 mb-2" />
                <span className="font-medium">Video</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType('audio')}
                className={`flex flex-col items-center px-4 py-4 rounded-lg border-2 transition ${
                  contentType === 'audio'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <Mic className="w-8 h-8 mb-2" />
                <span className="font-medium">Audio</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType('text')}
                className={`flex flex-col items-center px-4 py-4 rounded-lg border-2 transition ${
                  contentType === 'text'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <Type className="w-8 h-8 mb-2" />
                <span className="font-medium">Text</span>
              </button>
            </div>
          </div>

          {contentType !== 'text' ? (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-700">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Teleprompter Notes (Optional)</span>
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTeleprompter(!showTeleprompter)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showTeleprompter ? 'Hide' : 'Show'} Teleprompter
                  </button>
                </div>
                <textarea
                  value={teleprompterNotes}
                  onChange={(e) => setTeleprompterNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add bullet points or a script to help you during recording..."
                />

                {showTeleprompter && teleprompterNotes && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Scroll Speed
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={scrollSpeed}
                      onChange={(e) => setScrollSpeed(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      {scrollSpeed < 40 ? 'Slow' : scrollSpeed < 70 ? 'Medium' : 'Fast'}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 rounded-lg overflow-hidden mb-6 relative" style={{ minHeight: '400px' }}>
                <div className="aspect-video flex items-center justify-center relative">
                  {showTeleprompter && teleprompterNotes && isRecording && (
                    <div
                      ref={teleprompterRef}
                      className="absolute inset-0 bg-black bg-opacity-60 overflow-y-auto p-8"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      <div className="text-white text-2xl leading-relaxed whitespace-pre-wrap text-center">
                        {teleprompterNotes}
                      </div>
                    </div>
                  )}

                  {!isRecording ? (
                    <div className="text-center text-white z-10">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-75" />
                      <p className="text-lg mb-2">Ready to Record</p>
                      <p className="text-sm text-slate-400">
                        Click the record button below to start
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-white z-10">
                      <div className={`w-4 h-4 rounded-full mx-auto mb-4 ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
                      <p className="text-3xl font-bold mb-2">{formatTime(recordingTime)}</p>
                      <p className="text-sm text-slate-400">
                        {isPaused ? 'Paused' : 'Recording...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center space-x-4 mb-6">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center space-x-2 bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition"
                  >
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <>
                    {!isPaused ? (
                      <button
                        type="button"
                        onClick={pauseRecording}
                        className="flex items-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-700 transition"
                      >
                        <Pause className="w-5 h-5" />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={resumeRecording}
                        className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
                      >
                        <Play className="w-5 h-5" />
                        <span>Resume</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      <Check className="w-5 h-5" />
                      <span>Done</span>
                    </button>

                    <button
                      type="button"
                      onClick={resetRecording}
                      className="flex items-center space-x-2 bg-slate-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Reset</span>
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="mb-6">
              <label htmlFor="textAnswer" className="block text-sm font-medium text-slate-700 mb-2">
                Your Answer
              </label>
              <textarea
                id="textAnswer"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                rows={12}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your detailed answer here..."
              />
            </div>
          )}

          <div className="flex space-x-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || (contentType === 'text' && !textAnswer.trim()) || (contentType !== 'text' && recordingTime === 0)}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/questions/${question.id}`)}
              className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
