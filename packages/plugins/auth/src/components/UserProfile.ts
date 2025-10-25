/**
 * UserProfile Component
 * User profile display component
 */
export interface UserProfileProps {
  user: any;
  onLogout?: () => Promise<void>;
  onUpdate?: (updates: any) => Promise<void>;
  isLoading?: boolean;
}

export function UserProfile(props: UserProfileProps) {
  if (!props.user) {
    return '<div class="user-profile">No user logged in</div>';
  }

  const handleLogout = async () => {
    if (props.onLogout) {
      await props.onLogout();
    }
  };

  const handleUpdate = async (field: string, value: any) => {
    if (props.onUpdate) {
      await props.onUpdate({ [field]: value });
    }
  };

  return `
    <div class="user-profile">
      <h2>User Profile</h2>
      
      <div class="profile-section">
        <label>Email:</label>
        <p>${props.user.email}</p>
      </div>

      ${props.user.profile?.name ? `
        <div class="profile-section">
          <label>Name:</label>
          <p>${props.user.profile.name}</p>
        </div>
      ` : ''}

      ${props.user.createdAt ? `
        <div class="profile-section">
          <label>Member Since:</label>
          <p>${new Date(props.user.createdAt).toLocaleDateString()}</p>
        </div>
      ` : ''}

      <div class="profile-actions">
        <button 
          onclick="${handleLogout}" 
          disabled="${props.isLoading}"
          class="btn-logout"
        >
          ${props.isLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  `;
}
