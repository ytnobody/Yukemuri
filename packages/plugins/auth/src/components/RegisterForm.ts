/**
 * RegisterForm Component
 * User registration form component
 */
export interface RegisterFormProps {
  onSubmit: (email: string, password: string, name?: string) => Promise<void>
  isLoading?: boolean
  error?: string | null
  onSuccess?: () => void
}

export function RegisterForm(props: RegisterFormProps) {
  let email = ""
  let password = ""
  let name = ""

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!email || !password) {
      return
    }

    try {
      await props.onSubmit(email, password, name || undefined)
      if (props.onSuccess) {
        props.onSuccess()
      }
    } catch (error) {
      console.error("Registration error:", error)
    }
  }

  const handleEmailChange = (e: any) => {
    email = e.target.value
  }

  const handlePasswordChange = (e: any) => {
    password = e.target.value
  }

  const handleNameChange = (e: any) => {
    name = e.target.value
  }

  return `
    <form onsubmit="${handleSubmit}">
      <div>
        <label>
          Name (optional):
          <input 
            type="text" 
            name="name" 
            onchange="${handleNameChange}"
            disabled="${props.isLoading}"
          />
        </label>
      </div>

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

      ${props.error ? `<div class="error">${props.error}</div>` : ""}

      <button type="submit" disabled="${props.isLoading}">
        ${props.isLoading ? "Registering..." : "Register"}
      </button>
    </form>
  `
}
