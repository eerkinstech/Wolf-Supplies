import React, { useState } from 'react';
import { FaEnvelope, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Newsletter = ({ content = {} }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Get content with defaults
  const layout = content.layout || 'layout1';
  const title = content.title || 'Get the best deals in your inbox';
  const subtitle = content.subtitle || '';
  const description = content.description || 'Sign up for exclusive offers, new arrivals, and seasonal sales.';
  const inputPlaceholder = content.inputPlaceholder || 'you@domain.com';
  const buttonText = content.buttonText || 'Subscribe';
  const successTitle = content.successTitle || "You're subscribed!";
  const successMessage = content.successMessage || 'Thanks — check your email for the welcome offer.';
  const bgColor = content.bgColor || '#E5E5E5';
  const accentColor = content.accentColor || '#000000';
  const textColor = content.textColor || '#2F2F2F';
  const padding = content.padding || 64;
  const borderRadius = content.borderRadius || 16;
  const benefits = content.benefits || [
    { id: '1', title: 'No Spam', description: 'Only curated deals' },
    { id: '2', title: 'Early Access', description: 'Subscriber-only previews' },
    { id: '3', title: 'Easy Opt-out', description: 'One click to unsubscribe' }
  ];
  const stats = content.stats || [
    { id: '1', value: '500K+', label: 'Subscribers' },
    { id: '2', value: '50+', label: 'Weekly Deals' },
    { id: '3', value: '30%', label: 'Average Savings' }
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      setEmail('');
      toast.success('Successfully subscribed to our newsletter!');

      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    }, 1000);
  };

  // ====== LAYOUT 1: Vertical with Icon ======
  if (layout === 'layout1') {
    return (
      <section style={{
        padding: `${padding}px 16px`,
        background: `linear-gradient(to right, ${bgColor}, white)`
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div style={{ backgroundColor: `${accentColor}20`, padding: '16px', borderRadius: '9999px' }}>
                <FaEnvelope style={{ fontSize: '36px', color: accentColor }} />
              </div>
            </div>

            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: textColor,
              marginBottom: '8px'
            }}>
              {title}
            </h2>
            {subtitle && <p style={{ color: textColor, marginBottom: '12px', fontSize: '18px' }}>{subtitle}</p>}
            <p style={{ color: '#666', maxWidth: '512px', margin: '0 auto' }}>{description}</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: `${borderRadius}px`,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '40px'
          }}>
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1 w-full">
                    <label className="sr-only">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={inputPlaceholder}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        border: `2px solid #D0D0D0`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#000000'}
                      onBlur={(e) => e.target.style.borderColor = '#D0D0D0'}
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      backgroundColor: accentColor,
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        {buttonText}
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-100">
                  {benefits.map((benefit) => (
                    <div key={benefit.id} className="flex items-center gap-3">
                      <div style={{ backgroundColor: `${accentColor}15`, padding: '12px', borderRadius: '9999px' }}>
                        <FaCheckCircle style={{ color: accentColor, fontSize: '18px' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: textColor }}>{benefit.title}</p>
                        <p style={{ fontSize: '14px', color: '#666' }}>{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4 flex justify-center">
                  <div style={{ backgroundColor: `${accentColor}20`, padding: '12px', borderRadius: '9999px' }}>
                    <FaCheckCircle style={{ fontSize: '32px', color: accentColor }} />
                  </div>
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: textColor, marginBottom: '8px' }}>
                  {successTitle}
                </h3>
                <p style={{ color: '#666' }}>{successMessage}</p>
              </div>
            )}
          </div>

          {stats && stats.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-6 mt-8 text-center">
              {stats.map((stat) => (
                <div key={stat.id}>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: accentColor }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ====== LAYOUT 2: Two Columns - Image Left, Content Right ======
  if (layout === 'layout2') {
    const imageColWidth = content.imageColWidth || 35;
    const contentColWidth = 100 - imageColWidth;

    return (
      <section style={{
        padding: `${padding}px 16px`,
        backgroundColor: bgColor
      }}>
        <div className="max-w-7xl mx-auto">
          <div style={{
            display: 'flex',
            gap: '0',
            backgroundColor: 'white',
            borderRadius: `${borderRadius}px`,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #D0D0D0',
            overflow: 'hidden',
            minHeight: '320px'
          }}>
            {/* Column 1: Image (Left) */}
            <div style={{
              flex: `0 0 ${imageColWidth}%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              backgroundColor: '#E5E5E5',
              borderRight: '1px solid #D0D0D0'
            }}>
              {content.logoImage ? (
                <>
                  <img
                    src={content.logoImage}
                    alt="Newsletter Logo"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '240px',
                      height: 'auto',
                      objectFit: 'contain',
                      width: '100%'
                    }}
                    onError={(e) => {
                      console.error('❌ Image load error for URL:', e.target.src);
                      console.error('Error event:', e);
                    }}
                    onLoad={() => { }}
                  />
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#D0D0D0',
                  borderRadius: '8px',
                  color: '#6B6B6B',
                  fontSize: '14px',
                  fontWeight: '500',
                  minHeight: '240px'
                }}>
                  No Image
                </div>
              )}
            </div>

            {/* Column 2: Content (Right) */}
            <div style={{
              flex: `0 0 ${contentColWidth}%`,
              display: 'flex',
              flexDirection: 'column',
              padding: '40px',
              justifyContent: 'center',
              gap: '20px'
            }}>
              {/* Title and Description */}
              <div>
                <h2 style={{
                  fontSize: '26px',
                  fontWeight: 'bold',
                  color: textColor,
                  margin: '0 0 12px 0',
                  lineHeight: '1.3'
                }}>
                  {title}
                </h2>
                <p style={{
                  color: '#666',
                  margin: '0',
                  fontSize: '15px',
                  lineHeight: '1.6'
                }}>
                  {description}
                </p>
              </div>

              {/* Email Input and Button */}
              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={inputPlaceholder}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: `1px solid #D0D0D0`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#000000'}
                    onBlur={(e) => e.target.style.borderColor = '#D0D0D0'}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      backgroundColor: accentColor,
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      minWidth: '110px'
                    }}
                  >
                    {isLoading ? 'Subscribing...' : buttonText}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <div style={{ backgroundColor: `${accentColor}20`, padding: '10px', borderRadius: '9999px' }}>
                      <FaCheckCircle style={{ fontSize: '24px', color: accentColor }} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: textColor, margin: '0 0 4px 0' }}>
                    {successTitle}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>{successMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ====== LAYOUT 3: Simple Stack ======
  if (layout === 'layout3') {
    return (
      <section style={{
        padding: `${padding}px 16px`,
        backgroundColor: bgColor
      }}>
        <div className="max-w-2xl mx-auto">
          <div style={{
            backgroundColor: 'white',
            borderRadius: `${borderRadius}px`,
            padding: '40px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Title */}
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: textColor,
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              {title}
            </h2>

            {/* Description */}
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '24px',
              textAlign: 'center',
              margin: '0 0 24px 0'
            }}>
              {description}
            </p>

            {/* Email Form */}
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={inputPlaceholder}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `2px solid #D0D0D0`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#000000'}
                  onBlur={(e) => e.target.style.borderColor = '#D0D0D0'}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    backgroundColor: accentColor,
                    color: 'white',
                    padding: '14px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      {buttonText}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div className="mb-3 flex justify-center">
                  <div style={{ backgroundColor: `${accentColor}20`, padding: '12px', borderRadius: '9999px' }}>
                    <FaCheckCircle style={{ fontSize: '28px', color: accentColor }} />
                  </div>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: textColor, marginBottom: '8px' }}>
                  {successTitle}
                </h3>
                <p style={{ fontSize: '14px', color: '#666' }}>{successMessage}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return null;
};

export default Newsletter;
