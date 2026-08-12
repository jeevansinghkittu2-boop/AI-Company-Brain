"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

interface SettingsClientProps {
  userName: string;
  userEmail: string;
  userId: number;
}

interface Settings {
  darkMode: boolean;
  documentNotifications: boolean;
  activityNotifications: boolean;
}

export function SettingsClient({
  userName,
  userEmail,
  userId,
}: SettingsClientProps) {
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    documentNotifications: true,
    activityNotifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState(userName);
  const [savingName, setSavingName] = useState(false);

  // --------------------------------------------------
  // Load settings
  // --------------------------------------------------

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings");

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load settings"
          );
        }

        setSettings({
          darkMode: data.settings.darkMode,
          documentNotifications:
            data.settings.documentNotifications,
          activityNotifications:
            data.settings.activityNotifications,
        });

        // If API returns the current name, keep UI synchronized
        if (data.settings.name) {
          setName(data.settings.name);
        }
      } catch (error) {
        console.error("Load settings error:", error);

        setMessage("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  // --------------------------------------------------
  // Save name
  // --------------------------------------------------

  async function saveName() {
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setMessage("Name must contain at least 2 characters.");
      return;
    }

    if (trimmedName.length > 100) {
      setMessage("Name must be less than 100 characters.");
      return;
    }

    setSavingName(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update name."
        );
      }

      // Keep the local UI updated
      setName(
        data.settings?.name ||
          data.user?.name ||
          trimmedName
      );

      setMessage("Name updated successfully.");
    } catch (error) {
      console.error("Save name error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update name."
      );
    } finally {
      setSavingName(false);
    }
  }

  // --------------------------------------------------
  // Save setting
  // --------------------------------------------------

  async function updateSetting(
    field: keyof Settings,
    value: boolean
  ) {
    const previousSettings = settings;

    // Update UI immediately
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: value,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update setting"
        );
      }

      setSettings({
        darkMode: data.settings.darkMode,
        documentNotifications:
          data.settings.documentNotifications,
        activityNotifications:
          data.settings.activityNotifications,
      });

      setMessage("Settings saved.");
    } catch (error) {
      console.error("Update setting error:", error);

      // Roll back UI if saving failed
      setSettings(previousSettings);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save setting."
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Toggle component
  // --------------------------------------------------

  function Toggle({
    enabled,
    onChange,
    label,
  }: {
    enabled: boolean;
    onChange: () => void;
    label: string;
  }) {
    return (
      <button
        type="button"
        onClick={onChange}
        disabled={saving || loading}
        aria-label={label}
        aria-pressed={enabled}
        className={`relative w-12 h-6 rounded-full transition ${
          enabled ? "bg-blue-600" : "bg-gray-300"
        } ${
          saving || loading
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
            enabled ? "left-7" : "left-1"
          }`}
        />
      </button>
    );
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Settings
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your AI Company Brain preferences and
            account.
          </p>
        </div>

        {/* Save status */}
        {message && (
          <div
            className={`rounded-lg p-3 mb-6 text-sm ${
              message.includes("successfully") ||
              message === "Settings saved."
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Profile */}
        <section className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">
            Profile
          </h2>

          <div className="space-y-5">

            {/* Name */}
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Name
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  maxLength={100}
                  disabled={savingName}
                  className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Enter your name"
                />

                <button
                  type="button"
                  onClick={saveName}
                  disabled={
                    savingName ||
                    name.trim() === userName.trim()
                  }
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingName
                    ? "Saving..."
                    : "Save Name"}
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="font-medium text-gray-900 mt-1">
                {userEmail}
              </p>
            </div>

            {/* User ID */}
            <div>
              <p className="text-sm text-gray-500">
                User ID
              </p>

              <p className="font-medium text-gray-900 mt-1">
                {userId}
              </p>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">
            Appearance
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                Dark Mode
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Change the appearance of the application.
              </p>
            </div>

            <Toggle
              enabled={settings.darkMode}
              onChange={() =>
                updateSetting(
                  "darkMode",
                  !settings.darkMode
                )
              }
              label="Toggle dark mode"
            />
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">
            Notifications
          </h2>

          <div className="space-y-5">

            {/* Document notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Document Processing
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Notify me when document processing is
                  completed.
                </p>
              </div>

              <Toggle
                enabled={
                  settings.documentNotifications
                }
                onChange={() =>
                  updateSetting(
                    "documentNotifications",
                    !settings.documentNotifications
                  )
                }
                label="Toggle document notifications"
              />
            </div>

            {/* Activity notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Activity Notifications
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Notify me about important account
                  activity.
                </p>
              </div>

              <Toggle
                enabled={
                  settings.activityNotifications
                }
                onChange={() =>
                  updateSetting(
                    "activityNotifications",
                    !settings.activityNotifications
                  )
                }
                label="Toggle activity notifications"
              />
            </div>

          </div>
        </section>

        {/* Account */}
        <section className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">
            Account
          </h2>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">
                Sign out
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Sign out of your AI Company Brain account.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                signOut({
                  callbackUrl: "/login",
                })
              }
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </section>

        {/* About */}
        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">
            About
          </h2>

          <div className="space-y-3">

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Application
              </span>

              <span className="font-medium">
                AI Company Brain
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Version
              </span>

              <span className="font-medium">
                1.0.0
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Status
              </span>

              <span className="text-green-600 font-medium">
                Production Ready
              </span>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}