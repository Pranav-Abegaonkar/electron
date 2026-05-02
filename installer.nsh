; ============================================================
; installer.nsh — Custom NSIS hooks for TYHO
; Handles: running-instance guard, install errors, uninstall cleanup
; ============================================================

; ── Macro: Kill running instance before install ──────────────────────────────
!macro customInstall
  DetailPrint "Checking for running instances of TYHO..."
  ; Kill any running instance so files are not locked during install
  nsExec::ExecToStack 'taskkill /F /IM "TYHO.exe" /T'
  Pop $0  ; return code (ignored — app may not be running)
  Sleep 1500

  ; Verify the installation directory is writable before proceeding
  ClearErrors
  FileOpen $0 "$INSTDIR\write_test.tmp" w
  IfErrors install_dir_error install_dir_ok

  install_dir_error:
    MessageBox MB_ICONSTOP|MB_OK \
      "Cannot write to the installation directory:$\n$INSTDIR$\n$\nPlease run the installer as Administrator or choose a different directory." \
      /SD IDOK
    Abort

  install_dir_ok:
    FileClose $0
    Delete "$INSTDIR\write_test.tmp"
!macroend

; ── Macro: Custom uninstall — kill app and clean up all leftover data ────────
!macro customUninstall
  DetailPrint "Stopping TYHO before uninstall..."
  nsExec::ExecToStack 'taskkill /F /IM "TYHO.exe" /T'
  Pop $0
  Sleep 1000

  ; Remove Electron app-data directories (appId: com.tyho.app)
  DetailPrint "Removing application data..."
  RMDir /r "$APPDATA\TYHO"
  RMDir /r "$LOCALAPPDATA\TYHO"

  ; Remove any lingering Electron crash dumps
  RMDir /r "$LOCALAPPDATA\CrashDumps\TYHO.exe"

  ; Remove Start Menu shortcut folder
  RMDir /r "$SMPROGRAMS\TYHO"

  DetailPrint "Uninstall cleanup complete."
!macroend
