
    import React, { useState, useEffect } from 'react';
    import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
    import { Link, useNavigate } from 'react-router-dom';
    //import supabase from '../lib/supabase';

    const LoginPage = () => {
      const [email, setEmail] = useState('');
      const [verifyCode, setVerifyCode] = useState('');
      const [isSendingCode, setIsSendingCode] = useState(false);
      const [isVerifying, setIsVerifying] = useState(false);
      const [step, setStep] = useState('email'); // email, verify
      const [error, setError] = useState(null);
      const [success, setSuccess] = useState(null);
      const [countdown, setCountdown] = useState(0);
      const navigate = useNavigate();

      useEffect(() => {
        // 检查用户是否已登录
        const checkUser = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            navigate('/');
          }
        };
        
        checkUser();
      }, [navigate]);

      useEffect(() => {
        let timer;
        if (countdown > 0) {
          timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
      }, [countdown]);

      const handleSendCode = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!email || !email.includes('@')) {
          setError('请输入有效的邮箱地址');
          return;
        }
        
        setIsSendingCode(true);
        
        try {
          const { error } = await supabase.auth.signInWithOtp({
            email,
          });
          
          if (error) {
            throw error;
          }
          
          setStep('verify');
          setSuccess('验证码已发送到您的邮箱');
          setCountdown(60);
        } catch (err) {
          setError('发送验证码失败，请重试');
          console.error(err);
        } finally {
          setIsSendingCode(false);
        }
      };

      const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!verifyCode) {
          setError('请输入验证码');
          return;
        }
        
        setIsVerifying(true);
        
        try {
          const { error } = await supabase.auth.verifyOtp({
            email,
            token: verifyCode,
            type: 'email'
          });
          
          if (error) {
            throw error;
          }
          
          setSuccess('登录成功！');
          setTimeout(() => navigate('/'), 1000);
        } catch (err) {
          setError('验证码无效或已过期');
          console.error(err);
        } finally {
          setIsVerifying(false);
        }
      };

      return (
        <div className="min-h-screen flex flex-col bg-gray-50">
          <div className="navbar p-4 flex items-center">
            <Link to="/" className="btn-icon">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-gray-800 text-lg font-medium ml-4">用户登录</h1>
          </div>
          
          <div className="flex-grow flex flex-col justify-center items-center p-5">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 fade-in">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail size={32} className="text-blue-500" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-center mb-6">
                {step === 'email' ? '使用邮箱登录' : '输入验证码'}
              </h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center mb-4 text-sm text-red-600">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center mb-4 text-sm text-green-600">
                  <CheckCircle size={18} className="mr-2 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}
              
              {step === 'email' ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      电子邮箱
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="请输入您的邮箱"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSendingCode}
                    className={`w-full btn-primary ${isSendingCode ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSendingCode ? '发送中...' : '发送验证码'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                        验证码
                      </label>
                      <span className="text-xs text-gray-500">
                        {countdown > 0 ? `${countdown}秒后可重发` : ''}
                      </span>
                    </div>
                    <input
                      id="code"
                      type="text"
                      placeholder="请输入6位验证码"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      required
                      maxLength={6}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isVerifying}
                      className={`w-full btn-primary ${isVerifying ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isVerifying ? '验证中...' : '登录'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (countdown === 0) {
                          setStep('email');
                          setVerifyCode('');
                        }
                      }}
                      disabled={countdown > 0}
                      className={`w-full mt-3 btn-secondary ${countdown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      重新发送验证码
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            <div className="mt-6 text-sm text-gray-500 text-center">
              <p>登录后可以查看和管理您的历史记录</p>
            </div>
          </div>
        </div>
      );
    };

    export default LoginPage;
  