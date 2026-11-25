// Avvio di "Slay the Dig" per chi non sa cosa sia un file HTML: doppio clic sull'eseguibile e il gioco si apre
// in una finestra tutta sua (Edge o Chrome in modalità "app", senza barra degli indirizzi).
// Il gioco resta quello di sempre, nella cartella "gioco" accanto all'eseguibile.
// Salvataggi, opzioni e progressi stanno nel profilo del browser dedicato al gioco, in
// %LocalAppData%\SlayTheDig: non si perdono spostando la cartella o scaricando una versione nuova.
// Si compila con tools/crea_eseguibile.mjs (csc.exe di .NET Framework, già presente in Windows).
using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("Slay the Dig")]
[assembly: AssemblyProduct("Slay the Dig")]
[assembly: AssemblyVersion("1.0.0.0")]

static class Avvio
{
    const string TITOLO = "Slay the Dig";

    [STAThread]
    static void Main()
    {
        string cartella = AppDomain.CurrentDomain.BaseDirectory;
        string pagina = Path.Combine(cartella, "gioco", "index.html");
        if (!File.Exists(pagina))
        {
            MessageBox.Show("Non trovo la cartella \"gioco\" accanto a questo programma.\n\n" +
                "Estrai tutto il contenuto del file .zip in una cartella e avvia il gioco da lì.",
                TITOLO, MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }
        string indirizzo = new Uri(pagina).AbsoluteUri;
        string browser = TrovaBrowser();
        try
        {
            if (browser == null)
            {
                // Senza Edge né Chrome: il browser predefinito, in una scheda normale
                Process.Start(new ProcessStartInfo(pagina) { UseShellExecute = true });
                return;
            }
            string profilo = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SlayTheDig", "profilo");
            Directory.CreateDirectory(profilo);
            string argomenti = "--app=\"" + indirizzo + "\" --user-data-dir=\"" + profilo + "\" --start-maximized" +
                " --no-first-run --no-default-browser-check --disable-features=Translate --autoplay-policy=no-user-gesture-required";
            Process.Start(new ProcessStartInfo(browser, argomenti) { UseShellExecute = false });
        }
        catch (Exception e)
        {
            MessageBox.Show("Non riesco ad aprire il gioco:\n" + e.Message + "\n\nPuoi aprirlo a mano: cartella \"gioco\", file \"index.html\".",
                TITOLO, MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    // Edge o Chrome: prima il registro "App Paths" (vale per ogni cartella di installazione), poi i percorsi soliti
    static string TrovaBrowser()
    {
        foreach (string exe in new[] { "msedge.exe", "chrome.exe" })
        {
            foreach (RegistryKey radice in new[] { Registry.LocalMachine, Registry.CurrentUser })
            {
                try
                {
                    using (RegistryKey k = radice.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\" + exe))
                    {
                        string p = k == null ? null : k.GetValue(null) as string;
                        if (!string.IsNullOrEmpty(p) && File.Exists(p)) return p;
                    }
                }
                catch (Exception) { /* chiave non leggibile: si prova il prossimo posto */ }
            }
        }
        string[] basi = {
            Environment.GetEnvironmentVariable("ProgramFiles(x86)"), Environment.GetEnvironmentVariable("ProgramFiles"),
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData)
        };
        foreach (string relativo in new[] { @"Microsoft\Edge\Application\msedge.exe", @"Google\Chrome\Application\chrome.exe" })
        {
            foreach (string b in basi)
            {
                if (string.IsNullOrEmpty(b)) continue;
                string p = Path.Combine(b, relativo);
                if (File.Exists(p)) return p;
            }
        }
        return null;
    }
}
