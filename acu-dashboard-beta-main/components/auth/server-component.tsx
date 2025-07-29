import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserCheck, UserX } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export default async function ServerAuthComponent() {
  // Create server-side supabase client
  const supabase = await createClient()
  
  // Get the user using getUser - the secure way for server components
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get session - Note: This is less reliable for auth verification
  const { data: { session } } = await supabase.auth.getSession()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Server-Side Auth Status</CardTitle>
          <CardDescription>Using @supabase/ssr server client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Badge variant={user ? "default" : "outline"} className={user ? "bg-green-500" : ""}>
              {user ? "Authenticated" : "Not Authenticated"}
            </Badge>
            <span className="ml-2 text-sm text-muted-foreground">
              {user ? (
                <span className="flex items-center">
                  <UserCheck className="mr-1 h-4 w-4 text-green-500" />
                  User is authenticated on server
                </span>
              ) : (
                <span className="flex items-center">
                  <UserX className="mr-1 h-4 w-4 text-orange-500" />
                  No active session on server
                </span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Server-Side User Info</CardTitle>
          <CardDescription>User details from server component</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Email Verified:</strong> {user.email_confirmed_at ? "Yes" : "No"}</p>
              <p><strong>Auth Provider:</strong> {user.app_metadata?.provider || "Unknown"}</p>
              {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
                <div>
                  <p className="font-medium mt-2">User Metadata:</p>
                  <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded-md overflow-x-auto">
                    {JSON.stringify(user.user_metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Not signed in</p>
          )}
        </CardContent>
      </Card>
      
      {/* Session Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Server-Side Session Details</CardTitle>
          <CardDescription>Using supabase.auth.getSession()</CardDescription>
        </CardHeader>
        <CardContent>
          {session ? (
            <div>
              <p className="text-sm mb-2 text-amber-500">
                Note: For server-side auth verification, always use supabase.auth.getUser() instead of getSession().
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Expires At:</p>
                  <p className="text-sm text-muted-foreground">
                    {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Provider:</p>
                  <p className="text-sm text-muted-foreground">
                    {session.user?.app_metadata?.provider || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">User ID:</p>
                  <p className="text-sm text-muted-foreground">{session.user?.id}</p>
                </div>
                <div>
                  <p className="font-medium">Access Token:</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {session.access_token ? `${session.access_token.substring(0, 20)}...` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No active session</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}