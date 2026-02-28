import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { isDarkMode } = React.useContext(ThemeContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(credentials.username.trim(), credentials.password);
            if (result.success) {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser?.role === 'STUDENT') {
                    navigate('/student');
                } else if (storedUser?.role === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                setError(result.message || 'Invalid username or password.');
            }
        } catch (err) {
            setError('Authentication service unavailable.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (username, password) => {
        setError('');
        setLoading(true);
        try {
            const result = await login(username, password);
            if (result.success) {
                // Success handled by AuthContext and navigation
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-soft)',
                width: '100%',
                position: 'relative',
                zIndex: 2
            }}
        >
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        marginBottom: '28px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <img
                        src={isDarkMode ? '/assets/images/institutional-dark-logo.png' : '/assets/images/institutional-light-logo.png'}
                        alt="RIT Institutional Logo"
                        style={{
                            height: '70px',
                            width: 'auto',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
                        }}
                    />
                </motion.div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--color-accent-gold)', marginBottom: '8px' }}>Login</h2>
                <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.95rem' }}>Enter your credentials to access the Digital Twin.</p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        color: 'var(--color-danger)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        marginBottom: '24px',
                        borderLeft: '4px solid var(--color-danger)'
                    }}
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Input
                    label="username"
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    placeholder="username"
                    required
                />

                <Input
                    label="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="password"
                    required
                    rightElement={
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--theme-text-muted)',
                                fontSize: '1.2rem',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.3s ease'
                            }}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    }
                />

                <Button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        marginTop: '16px',
                        padding: '16px 32px',
                        fontSize: '1.1rem',
                        borderRadius: '12px',
                        backgroundColor: 'var(--color-primary-navy, #0b2c6b)',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: '700',
                        boxShadow: '0 8px 16px rgba(11, 44, 107, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.8 : 1
                    }}
                    onMouseOver={(e) => {
                        if (!loading) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 20px rgba(11, 44, 107, 0.3)';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!loading) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(11, 44, 107, 0.2)';
                        }
                    }}
                >
                    {loading ? 'Signing in...' : 'Login'}
                </Button>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Quick Access (Demo)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <button
                        onClick={() => handleQuickLogin('admin@ritchennai.edu.in', 'admin123')}
                        className="quick-login-btn"
                        style={{ '--btn-color': '#var(--color-accent-gold)' }}
                        disabled={loading}
                    >
                        Admin
                    </button>
                    <button
                        onClick={() => handleQuickLogin('faculty@ritchennai.edu.in', 'faculty123')}
                        className="quick-login-btn"
                        disabled={loading}
                    >
                        Faculty
                    </button>
                    <button
                        onClick={() => handleQuickLogin('student@ritchennai.edu.in', 'student123')}
                        className="quick-login-btn"
                        disabled={loading}
                    >
                        Student
                    </button>
                </div>
                <style>{`
                    .quick-login-btn {
                        padding: 10px;
                        border-radius: 10px;
                        border: 1px solid var(--glass-border);
                        background: rgba(255,255,255,0.03);
                        color: var(--theme-text-muted);
                        font-size: 0.75rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .quick-login-btn:hover {
                        background: rgba(255,255,255,0.08);
                        color: var(--theme-text);
                        border-color: var(--color-accent-gold);
                        transform: translateY(-1px);
                    }
                `}</style>
            </div>

            <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                New to the ecosystem? {' '}
                <Link to="/register" style={{ color: 'var(--color-accent-gold)', fontWeight: '600', textDecoration: 'none' }}>
                    Request Access
                </Link>
            </div>
        </motion.div>
    );
};

export default LoginPage;
