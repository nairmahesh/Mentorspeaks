import { PublicLayout } from '../components/PublicLayout';
import { Users, Target, BookOpen, Heart, Linkedin } from 'lucide-react';

export function AboutPage() {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">About effyMentor</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Connecting aspiring professionals with experienced mentors through authentic conversations and meaningful guidance.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-20">
          <div className="flex items-center space-x-3 mb-8">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-slate-900">Our Story</h2>
          </div>
          <div className="prose prose-lg max-w-none text-slate-700 space-y-6">
            <p>
              In 2023, three professionals from different corners of the world shared a common frustration: finding genuine,
              accessible career guidance was nearly impossible. LinkedIn was flooded with superficial advice, mentorship
              platforms were expensive and impersonal, and traditional career counseling felt disconnected from the realities
              of modern work.
            </p>
            <p>
              Priya, a software engineer in Bangalore, remembered the informal chai sessions with her senior colleague that
              shaped her career more than any formal training. Amit, a product manager in Mumbai, wished he'd had someone to
              talk to before making a costly career pivot. And Sarah, a marketing director in Dubai, saw talented professionals
              around her struggling with decisions she'd navigated years ago.
            </p>
            <p>
              They realized something fundamental: the most valuable career insights don't come from polished TED talks or
              expensive courses. They come from real conversations with people who've been there—the mistakes they made,
              the choices they regret, the strategies that actually worked.
            </p>
            <p>
              That's how effyMentor was born. Not as another networking platform or course marketplace, but as a space for
              authentic, accessible knowledge sharing. A place where a college student in Dhaka can get career advice from a
              CTO in Singapore, where a mid-career professional can ask honest questions about work-life balance, and where
              experienced professionals can give back to the next generation.
            </p>
            <p>
              Today, we're building a global community where experience speaks—unfiltered, practical, and human.
            </p>
          </div>
        </section>

        <section className="mb-20 bg-blue-50 rounded-2xl p-12">
          <div className="flex items-center space-x-3 mb-8">
            <Target className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
          </div>
          <p className="text-xl text-slate-700 leading-relaxed mb-6">
            To democratize access to career wisdom by connecting professionals across generations, industries, and
            geographies through authentic conversations and meaningful mentorship.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-3">Accessible</h3>
              <p className="text-slate-600">Quality mentorship shouldn't be locked behind paywalls or exclusive networks.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-3">Authentic</h3>
              <p className="text-slate-600">Real experiences, honest conversations, and unfiltered insights.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-3">Global</h3>
              <p className="text-slate-600">Breaking geographical boundaries to connect talent and experience worldwide.</p>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="flex items-center space-x-3 mb-8">
            <Heart className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-slate-900">Our Methodology</h2>
          </div>
          <div className="space-y-8">
            <div className="border-l-4 border-blue-600 pl-6 py-2">
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. Question-Based Learning</h3>
              <p className="text-slate-700 leading-relaxed">
                We believe the best learning starts with good questions. Our platform allows professionals to ask specific,
                real-world questions and receive video responses from multiple mentors, offering diverse perspectives on
                the same challenge.
              </p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6 py-2">
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. Industry Corners</h3>
              <p className="text-slate-700 leading-relaxed">
                Each industry has its unique challenges and unwritten rules. We organize our community into industry-specific
                corners where professionals can engage with mentors who truly understand their field—from tech to healthcare,
                finance to creative industries.
              </p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6 py-2">
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. Authentic Podcasts</h3>
              <p className="text-slate-700 leading-relaxed">
                Our podcast series features unscripted conversations with professionals about their career journeys—including
                the pivots, failures, and lessons learned. These aren't rehearsed success stories; they're real talk about
                real careers.
              </p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6 py-2">
              <h3 className="text-xl font-bold text-slate-900 mb-3">4. Regional Chapters</h3>
              <p className="text-slate-700 leading-relaxed">
                While we're global in reach, we're local in relevance. Our regional chapters ensure that advice is culturally
                relevant and contextually appropriate, whether you're navigating careers in Mumbai, Dubai, Singapore, or Dhaka.
              </p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6 py-2">
              <h3 className="text-xl font-bold text-slate-900 mb-3">5. Quality Over Quantity</h3>
              <p className="text-slate-700 leading-relaxed">
                We carefully curate our mentor community, prioritizing professionals who genuinely want to give back and have
                meaningful experience to share. Every mentor is verified, and we maintain high standards for engagement quality.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="flex items-center space-x-3 mb-8">
            <Users className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-slate-900">Our Team</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-48 flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                  <Users className="w-16 h-16 text-blue-600" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900">Priya Sharma</h3>
                  <a href="#" className="text-blue-600 hover:text-blue-700">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
                <p className="text-blue-600 font-medium mb-3">Co-Founder & CEO</p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Former Engineering Lead at a Fortune 500 company. 12 years building products and teams across India and
                  Southeast Asia. Passionate about democratizing career guidance.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-green-500 to-green-600 h-48 flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                  <Users className="w-16 h-16 text-green-600" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900">Amit Patel</h3>
                  <a href="#" className="text-blue-600 hover:text-blue-700">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
                <p className="text-green-600 font-medium mb-3">Co-Founder & CPO</p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Product strategist with experience at leading tech startups. Made 3 career pivots and wants to help others
                  navigate transitions with confidence and clarity.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 h-48 flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                  <Users className="w-16 h-16 text-orange-600" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900">Sarah Al-Mansoori</h3>
                  <a href="#" className="text-blue-600 hover:text-blue-700">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
                <p className="text-orange-600 font-medium mb-3">Co-Founder & CMO</p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Marketing leader who built global brands from the ground up. Believes in the power of authentic storytelling
                  and community-driven growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="flex items-center space-x-3 mb-8">
            <Users className="w-8 h-8 text-slate-600" />
            <h2 className="text-3xl font-bold text-slate-900">Our Advisors</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Dr. Rajesh Kumar</h3>
                  <p className="text-slate-600 text-sm">Education & Learning Design</p>
                </div>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                Former Dean at IIM Bangalore. 25+ years in education innovation and adult learning methodologies.
                Advisor to multiple edtech startups.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Lisa Chen</h3>
                  <p className="text-slate-600 text-sm">Technology & Product</p>
                </div>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                VP of Engineering at a unicorn startup. Expert in building scalable platforms and fostering engineering
                culture. Passionate mentor to women in tech.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Mohammed Al-Rashid</h3>
                  <p className="text-slate-600 text-sm">Business Strategy & Growth</p>
                </div>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                Serial entrepreneur and investor. Built and exited 3 companies across MENA and Asia. Focuses on sustainable
                growth and community-first business models.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Dr. Ananya Desai</h3>
                  <p className="text-slate-600 text-sm">Psychology & Career Development</p>
                </div>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                Organizational psychologist specializing in career transitions and workplace well-being. Published researcher
                and career counselor with 15+ years experience.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you're seeking guidance or ready to share your experience, we'd love to have you in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition"
            >
              Get Started
            </a>
            <a
              href="/mentors"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-400 transition"
            >
              Become a Mentor
            </a>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
