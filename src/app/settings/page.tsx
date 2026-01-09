"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardHeader, Button, Alert } from "@/components/ui";
import { RefreshCw, Database, Upload, Download, Smartphone, Check, User, Lock, Edit2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { account } from "@/lib/appwrite";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const [autoCreateSKU, setAutoCreateSKU] = useState(true);
  const [autoCreateLocation, setAutoCreateLocation] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  
  // User profile update states
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Handler name states
  const [handlerName, setHandlerName] = useState("");
  const [isEditingHandler, setIsEditingHandler] = useState(false);
  const [newHandlerName, setNewHandlerName] = useState("");
  const [isUpdatingHandler, setIsUpdatingHandler] = useState(false);

  useEffect(() => {
    // Load settings from env variables
    setAutoCreateSKU(process.env.NEXT_PUBLIC_AUTO_CREATE_SKU === "true");
    setAutoCreateLocation(process.env.NEXT_PUBLIC_AUTO_CREATE_LOCATION === "true");

    // Load handler name from localStorage
    const storedHandlerName = localStorage.getItem("handlerName");
    if (storedHandlerName) {
      setHandlerName(storedHandlerName);
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("App installed successfully!");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      toast.error("Installation is not available at this time");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        toast.success("Installing app...");
      } else {
        toast.info("Installation cancelled");
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Install error:", error);
      toast.error("Failed to install app");
    }
  };

  const handleImportItemMaster = async () => {
    if (!confirm("This will import/update SKU data from 'Item Master (1).xlsx'. Continue?")) {
      return;
    }

    setIsImporting(true);
    try {
      const response = await fetch("/api/import-item-master", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      const result = await response.json();
      toast.success(`Import completed! Imported: ${result.imported}, Updated: ${result.updated}`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import Item Master data");
    } finally {
      setIsImporting(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsUpdatingName(true);
    try {
      await account.updateName(newName.trim());
      toast.success("Name updated successfully!");
      setIsEditingName(false);
      setNewName("");
      // Refresh the page to update the user info
      window.location.reload();
    } catch (error) {
      console.error("Update name error:", error);
      toast.error("Failed to update name");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await account.updatePassword(newPassword, currentPassword);
      toast.success("Password changed successfully!");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Failed to change password. Check your current password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateHandlerName = () => {
    if (!newHandlerName.trim()) {
      toast.error("Handler name cannot be empty");
      return;
    }

    setIsUpdatingHandler(true);
    try {
      const name = newHandlerName.trim();
      localStorage.setItem("handlerName", name);
      localStorage.setItem("lastHandlerPromptTime", Date.now().toString());
      setHandlerName(name);
      toast.success("Handler name updated successfully!");
      setIsEditingHandler(false);
      setNewHandlerName("");
    } catch (error) {
      console.error("Update handler name error:", error);
      toast.error("Failed to update handler name");
    } finally {
      setIsUpdatingHandler(false);
    }
  };

  return (
    <PageLayout
      title="Settings"
      description="Configure application settings and preferences"
      maxWidth="lg"
    >
      {/* User Profile */}
      <Card className="mb-6">
        <CardHeader 
          title="User Profile" 
          description="Manage your account information"
        />
        <div className="space-y-4">
          {/* Name Section */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Name</span>
                </div>
                {!isEditingName ? (
                  <p className="text-base text-gray-900">{user?.name || "-"}</p>
                ) : (
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
              {!isEditingName ? (
                <Button
                  onClick={() => {
                    setNewName(user?.name || "");
                    setIsEditingName(true);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName("");
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateName}
                    disabled={isUpdatingName}
                    size="sm"
                  >
                    {isUpdatingName ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Email Section (Read-only) */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-700">Email</span>
            </div>
            <p className="text-base text-gray-900">{user?.email || "-"}</p>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Handler Name Section */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Handler Name</span>
                </div>
                {!isEditingHandler ? (
                  <div>
                    <p className="text-base text-gray-900">{handlerName || "Not set"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Used to track your inventory actions
                    </p>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={newHandlerName}
                    onChange={(e) => setNewHandlerName(e.target.value)}
                    placeholder="Enter handler name"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                )}
              </div>
              {!isEditingHandler ? (
                <Button
                  onClick={() => {
                    setNewHandlerName(handlerName);
                    setIsEditingHandler(true);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  {handlerName ? "Edit" : "Set"}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsEditingHandler(false);
                      setNewHandlerName("");
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateHandlerName}
                    disabled={isUpdatingHandler}
                    size="sm"
                  >
                    {isUpdatingHandler ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Password Section */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Password</span>
                </div>
                {!isChangingPassword ? (
                  <p className="text-base text-gray-900">••••••••</p>
                ) : (
                  <div className="space-y-3 mt-2">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 8 characters)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              {!isChangingPassword ? (
                <Button
                  onClick={() => setIsChangingPassword(true)}
                  variant="secondary"
                  size="sm"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Change
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={isUpdatingPassword}
                    size="sm"
                  >
                    {isUpdatingPassword ? "Updating..." : "Update"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Role Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Role</span>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                isAdmin ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
              }`}>
                {isAdmin ? "Admin" : "User"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* App Configuration */}
      <Card className="mb-6">
        <CardHeader 
          title="Application Configuration" 
          description="Current environment settings"
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Auto-Create SKUs</p>
              <p className="text-sm text-gray-500">
                Automatically create SKUs when scanning unknown EAN codes
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              autoCreateSKU ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
            }`}>
              {autoCreateSKU ? "Enabled" : "Disabled"}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Auto-Create Locations</p>
              <p className="text-sm text-gray-500">
                Automatically create locations when scanning unknown location codes
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              autoCreateLocation ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
            }`}>
              {autoCreateLocation ? "Enabled" : "Disabled"}
            </div>
          </div>

          <Alert 
            type="info" 
            message="These settings are configured in the .env file and require server restart to change."
          />
        </div>
      </Card>

      {/* Data Management (Admin Only) */}
      {isAdmin && (
        <Card className="mb-6">
          <CardHeader 
            title="Data Management" 
            description="Import and manage inventory data"
          />
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Import Item Master</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Import SKU data from &quot;Item Master (1).xlsx&quot; to map EAN codes to Item Codes.
                    This will create new SKUs and update existing ones with Item Code mappings and details.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleImportItemMaster}
                disabled={isImporting}
                className="w-full"
                size="lg"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Import Item Master
                  </>
                )}
              </Button>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> The import file &quot;Item Master (1).xlsx&quot; must be placed in the project root directory. 
                The import process will read: Item Code (Column A), EAN (Column G), Item Name, and Details/Item Details columns.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* PWA Installation */}
      <Card className="mb-6">
        <CardHeader 
          title="Install App" 
          description="Install this app on your device for a better experience"
        />
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Progressive Web App</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Install Warehouse Mapping on your device to use it like a native app with offline support, 
                  faster loading times, and easy access from your home screen.
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Works offline with cached data
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Quick access from home screen
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Native app-like experience
                  </li>
                </ul>
              </div>
            </div>

            {isInstalled ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">App is already installed</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  You can access it from your device&apos;s home screen or app drawer.
                </p>
              </div>
            ) : deferredPrompt ? (
              <Button
                onClick={handleInstallApp}
                className="w-full"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    How to Install Manually:
                  </p>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p><strong>Chrome/Edge (Desktop):</strong> Click the install icon (⊕) in the address bar, or go to Menu → &quot;Install Warehouse Mapping&quot;</p>
                    <p><strong>Chrome (Android):</strong> Tap Menu (⋮) → &quot;Add to Home screen&quot; or &quot;Install app&quot;</p>
                    <p><strong>Safari (iOS):</strong> Tap Share (↑) → &quot;Add to Home Screen&quot;</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> The automatic install button requires HTTPS and a supported browser. 
                    If you&apos;re on the production site (https://wmslifelong.cloud) and still don&apos;t see the install option, 
                    use the manual installation methods above.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/*         <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Import Item Master
                  </>
                )}
              </Button>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> The import file &quot;Item Master (1).xlsx&quot; must be placed in the project root directory. 
                The import process will read EAN codes from column G and Item Codes from column A.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* System Information */}
      <Card>
        <CardHeader title="System Information" />
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">App Name</span>
            <span className="text-sm text-gray-900">{process.env.NEXT_PUBLIC_APP_NAME}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Project</span>
            <span className="text-sm text-gray-900">{process.env.NEXT_PUBLIC_APPWRITE_PROJECT_NAME}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Environment</span>
            <span className="text-sm text-gray-900">Production</span>
          </div>
        </div>
      </Card>
    </PageLayout>
  );
}
