package com.vocaflash.app;

import android.os.Build;
import android.speech.tts.TextToSpeech;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Locale;

@CapacitorPlugin(name = "NativeTts")
public class NativeTtsPlugin extends Plugin implements TextToSpeech.OnInitListener {
    private TextToSpeech textToSpeech;
    private boolean isReady = false;
    private PendingSpeech pendingSpeech;

    private static class PendingSpeech {
        final String text;
        final float rate;
        final PluginCall call;

        PendingSpeech(String text, float rate, PluginCall call) {
            this.text = text;
            this.rate = rate;
            this.call = call;
        }
    }

    @Override
    public void load() {
        textToSpeech = new TextToSpeech(getContext(), this);
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            isReady = true;
            textToSpeech.setLanguage(Locale.US);
            if (pendingSpeech != null) {
                speakNow(pendingSpeech.text, pendingSpeech.rate);
                pendingSpeech.call.resolve();
                pendingSpeech = null;
            }
            return;
        }

        if (pendingSpeech != null) {
            pendingSpeech.call.reject("Android TextToSpeech initialization failed");
            pendingSpeech = null;
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        if (text == null || text.trim().isEmpty()) {
            call.resolve();
            return;
        }

        Float requestedRate = call.getFloat("rate", 0.85F);
        float rate = requestedRate == null || requestedRate <= 0 ? 0.85F : requestedRate;

        if (textToSpeech == null) {
            textToSpeech = new TextToSpeech(getContext(), this);
        }

        if (!isReady) {
            pendingSpeech = new PendingSpeech(text, rate, call);
            return;
        }

        speakNow(text, rate);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (textToSpeech != null) {
            textToSpeech.stop();
        }
        pendingSpeech = null;
        call.resolve();
    }

    private void speakNow(String text, float rate) {
        textToSpeech.stop();
        textToSpeech.setLanguage(Locale.US);
        textToSpeech.setSpeechRate(rate);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "vocaflash-tts");
        } else {
            textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null);
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
            textToSpeech = null;
        }
        pendingSpeech = null;
        super.handleOnDestroy();
    }
}
