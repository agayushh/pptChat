import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#212121] to-[#2a2a2a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#10a37f] to-[#0e906e] rounded-2xl mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Create your account
          </h1>
          <p className="text-gray-400 text-lg">Sign up to start chatting with AI</p>
        </div>
        <div className="animate-slideUp">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-[#10a37f] to-[#0e906e] hover:from-[#0e906e] hover:to-[#0c7d5c] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]',
                card: 'bg-[#2a2a2a] shadow-2xl border border-[#3a3a3a] backdrop-blur-sm',
                headerTitle: 'text-white font-semibold',
                headerSubtitle: 'text-gray-400',
                socialButtonsIconButton: 'border-[#565869] hover:bg-[#2f2f2f] hover:border-[#6b7280] transition-all duration-200',
                formFieldInput: 'bg-[#40414f] border-[#565869] text-white focus:border-[#10a37f] transition-colors',
                formFieldLabel: 'text-gray-300',
                footerActionText: 'text-gray-400',
                footerActionLink: 'text-[#10a37f] hover:text-[#0e906e] transition-colors',
                dividerText: 'text-gray-400',
                dividerLine: 'bg-[#3a3a3a]',
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
