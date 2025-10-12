import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, Video, Mic, Square, Play, ArrowLeft, VideoOff, User } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  recording_type: string;
  guest: { full_name: string; id: string; avatar_url?: string };
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
  const [showVideo, setShowVideo] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<Analyser | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    loadEpisodeData();
    return () => {
      stopMediaStream();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [episodeId]);

  const loadEpisodeData = async () => {
    if (!episodeId) return;

    const [episodeResult, questionsResult] = await Promise.all([
      supabase
        .from('podcast_episodes')
        .select(`
          *,
          guest:guest_id(id, full_name, avatar_url),
          moderator:moderator_id(full_name)
        `)
        .eq('id', episodeId)
        .maybeSingle(),
      supabase
        .from('podcast_questions')
        .select('*')
        .eq('episode_id', episodeId)
        .order('question_order')
    ]);

    if (episodeResult.data) setEpisode(episodeResult.data as any);
    if (questionsResult.data) setQuestions(questionsResult.data);

    setLoading(false);

    if (episodeResult.data) {
      await initializeMedia(episodeResult.data.recording_type);
    }
  };

  const initializeMedia = async (recordingType: string) => {
    try {
      const constraints = recordingType === 'video'
        ? { video: true, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current && recordingType === 'video') {
        videoRef.current.srcObject = stream;
      }

      setupAudioAnalyser(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please grant permissions and try again.');
    }
  };

  const setupAudioAnalyser = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    microphone.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    detectAudio();
  };

  const detectAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudio = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel(average);
      setIsSpeaking(average > 20);

      animationFrameRef.current = requestAnimationFrame(checkAudio);
    };

    checkAudio();
  };

  const stopMediaStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
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
      await startRecording();
    } else {
      await stopRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = videoRef.current?.srcObject as MediaStream ||
                     await navigator.mediaDevices.getUserMedia({ audio: true });

      const options = { mimeType: 'video/webm;codecs=vp9' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      await supabase
        .from('podcast_episodes')
        .update({ status: 'recording' })
        .eq('id', episodeId);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start recording. Please check permissions.');
    }
  };

  const stopRecording = () => {
    return new Promise<void>((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, {
            type: 'video/webm'
          });

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${episode?.title || 'recording'}.webm`;
          a.click();

          resolve();
        };

        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } else {
        setIsRecording(false);
        resolve();
      }
    });
  };

  const completeRecording = async () => {
    if (isRecording) {
      await stopRecording();
    }

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/podcasts/manage')}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{episode.title}</h1>
              <p className="text-sm text-slate-400 mt-1">
                Guest: {episode.guest?.full_name} | Moderator: {episode.moderator?.full_name}
              </p>
            </div>
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

      <div className="grid grid-cols-2 h-[calc(100vh-120px)]">
        <div className="bg-slate-950 flex items-center justify-center border-r border-slate-700">
          <div className="text-center w-full max-w-2xl px-8">
            {episode.recording_type === 'video' ? (
              <div className="relative">
                {showVideo ? (
                  <div className="relative w-full aspect-video bg-slate-800 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-slate-900/90 px-3 py-2 rounded-lg">
                      <p className="text-sm font-semibold">{episode.guest?.full_name}</p>
                      <p className="text-xs text-slate-400">Guest</p>
                    </div>
                    <button
                      onClick={() => setShowVideo(false)}
                      className="absolute top-4 right-4 bg-slate-900/90 hover:bg-slate-800 p-2 rounded-lg transition"
                      title="Hide Video"
                    >
                      <VideoOff className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full aspect-video bg-slate-800 rounded-lg flex flex-col items-center justify-center">
                    <div className="relative">
                      {episode.guest?.avatar_url ? (
                        <img
                          src={episode.guest.avatar_url}
                          alt={episode.guest.full_name}
                          className="w-32 h-32 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">
                            {getInitials(episode.guest?.full_name || 'G')}
                          </span>
                        </div>
                      )}

                      {isSpeaking && (
                        <div className="absolute -inset-3 rounded-full border-4 border-green-500 animate-pulse"></div>
                      )}
                    </div>

                    <p className="text-xl font-semibold mt-6">{episode.guest?.full_name}</p>
                    <p className="text-sm text-slate-400 mt-1">Guest</p>

                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute top-4 right-4 bg-slate-900/90 hover:bg-slate-800 p-2 rounded-lg transition"
                      title="Show Video"
                    >
                      <Video className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-video bg-slate-800 rounded-lg flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  {episode.guest?.avatar_url ? (
                    <img
                      src={episode.guest.avatar_url}
                      alt={episode.guest.full_name}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {getInitials(episode.guest?.full_name || 'G')}
                      </span>
                    </div>
                  )}

                  {isSpeaking && (
                    <div className="absolute -inset-3 rounded-full border-4 border-green-500 animate-pulse"></div>
                  )}
                </div>

                <p className="text-xl font-semibold">{episode.guest?.full_name}</p>
                <p className="text-sm text-slate-400 mt-1">Guest - Audio Only</p>

                <div className="flex space-x-2 mt-8">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-cyan-500 rounded-full transition-all"
                      style={{
                        height: isRecording && isSpeaking
                          ? `${Math.random() * 60 + 20}px`
                          : '20px',
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 flex flex-col">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 border-b border-slate-700">
            <div className="text-sm font-semibold text-blue-200 mb-3">
              CURRENT QUESTION
            </div>
            <h2 className="text-2xl font-bold leading-relaxed">
              {currentQuestion?.question_text || 'No questions available'}
            </h2>
          </div>

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
