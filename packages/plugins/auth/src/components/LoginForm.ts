/**
 * LoginForm Component
 * Login form for user authentication
 */
export interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onSuccess?: () => void;
}

export function LoginForm(props: LoginFormProps) {
  let email = '';
  let password = '';

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    try {
      await props.onSubmit(email, password);
      if (props.onSuccess) {
        props.onSuccess();
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleEmailChange = (e: any) => {
    email = e.target.value;
  };

  const handlePasswordChange = (e: any) => {
    password = e.target.value;
  };

  return `
    <form onsubmit="${handleSubmit}">
      <div>
        <label>
          Email:
          <input 
            type="email" 
            name="email" 
            required 
            onchange="${handleEmailChange}"
            disabled="${props.isLoading}"
          />
        </label>
      </div>
      
      <div>
        <label>
          Password:
          <input 
            type="password" 
            name="password" 
            required 
            onchange="${handlePasswordChange}"
            disabled="${props.isLoading}"
          />
        </label>
      </div>

      ${props.error ? `<div class="error">${props.error}</div>` : ''}

      <button type="submit" disabled="${props.isLoading}">
        ${props.isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  `;
}
