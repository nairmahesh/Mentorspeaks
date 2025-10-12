import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, Video, Mic, Square, Play } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  recording_type: string;
  guest: { full_name: string; id: string };
  moderator: { full_name: string };
}

interface Question {
  id: string;
  question_text: string;
  answer_text: string;
  question_order: number;
}

export function PodcastRecordingPage() {
  const { episodeId } = useParams();
  const navigate = useNavigate();

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEpisodeData();
  }, [episodeId]);

  const loadEpisodeData = async () => {
    if (!episodeId) return;

    const [episodeResult, questionsResult] = await Promise.all([
      supabase
        .from('podcast_episodes')
        .select(`
          *,
          guest:guest_id(id, full_name),
          moderator:moderator_id(full_name)
        `)
        .eq('id', episodeId)
        .single(),
      supabase
        .from('podcast_questions')
        .select('*')
        .eq('episode_id', episodeId)
        .order('question_order')
    ]);

    if (episodeResult.data) setEpisode(episodeResult.data as any);
    if (questionsResult.data) setQuestions(questionsResult.data);

    setLoading(false);
  };

  const currentQuestion = questions[currentQuestionIndex];

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      await supabase
        .from('podcast_episodes')
        .update({ status: 'recording' })
        .eq('id', episodeId);
    }
    setIsRecording(!isRecording);
  };

  const completeRecording = async () => {
    await supabase
      .from('podcast_episodes')
      .update({ status: 'completed' })
      .eq('id', episodeId);

    navigate('/podcasts/manage');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading episode...</p>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Episode not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{episode.title}</h1>
            <p className="text-sm text-slate-400 mt-1">
              Guest: {episode.guest?.full_name} | Moderator: {episode.moderator?.full_name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            {isRecording && (
              <div className="flex items-center space-x-2 bg-red-600 px-4 py-2 rounded-full animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-sm font-semibold">RECORDING</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Recording Area */}
      <div className="grid grid-cols-2 h-[calc(100vh-120px)]">
        {/* Video/Audio Preview - Left Side */}
        <div className="bg-slate-950 flex items-center justify-center border-r border-slate-700">
          <div className="text-center">
            {episode.recording_type === 'video' ? (
              <div className="relative">
                <div className="w-96 h-72 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Video className="w-24 h-24 text-slate-600" />
                </div>
                <div className="absolute bottom-4 left-4 bg-slate-900/90 px-3 py-2 rounded-lg">
                  <p className="text-sm font-semibold">{episode.guest?.full_name}</p>
                  <p className="text-xs text-slate-400">Guest</p>
                </div>
              </div>
            ) : (
              <div className="w-96 h-72 bg-slate-800 rounded-lg flex flex-col items-center justify-center">
                <Mic className="w-24 h-24 text-slate-600 mb-4" />
                <div className="flex space-x-2">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-blue-500 rounded-full"
                      style={{
                        height: `${Math.random() * 60 + 20}px`,
                        animation: isRecording ? 'pulse 0.5s infinite' : 'none'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Question & Teleprompter - Right Side */}
        <div className="bg-slate-900 flex flex-col">
          {/* Current Question */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 border-b border-slate-700">
            <div className="text-sm font-semibold text-blue-200 mb-3">
              CURRENT QUESTION
            </div>
            <h2 className="text-2xl font-bold leading-relaxed">
              {currentQuestion?.question_text || 'No questions available'}
            </h2>
          </div>

          {/* Teleprompter Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="text-sm font-semibold text-slate-400 mb-4">
              TELEPROMPTER / PRE-FILLED ANSWER
            </div>
            {currentQuestion?.answer_text ? (
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-slate-200">
                  {currentQuestion.answer_text}
                </p>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>No pre-filled answer available.</p>
                <p className="text-sm mt-2">The guest can answer freely.</p>
              </div>
            )}
          </div>

          {/* Question Navigation */}
          <div className="bg-slate-800 border-t border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              <div className="flex space-x-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg font-semibold transition ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Controls - Bottom */}
      <div className="bg-slate-800 border-t border-slate-700 px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleRecording}
            className={`flex items-center space-x-3 px-8 py-4 rounded-lg font-semibold text-lg transition ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-6 h-6" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                <span>Start Recording</span>
              </>
            )}
          </button>

          <button
            onClick={completeRecording}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Complete & Save
          </button>

          <button
            onClick={() => navigate('/podcasts/manage')}
            className="px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
