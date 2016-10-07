/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Java.src.steganography_tool;

import java.io.File;
import java.io.IOException;
import java.util.Scanner;
import java.io.FileInputStream;
import java.io.FileOutputStream;
/**
 *
 * @author igork
 */
public class Steganography_Tool {

    /**
     * @param args the command line arguments
     */
    

    /* args
            0              1                 2       3           4
           Hide TypeOfObject[string file] Object WhereToHide ResultName
           
              0                1                 2       3  
           Retrieve TypeOfObject[string file]  Carrier  Result 
    */
    public static void main(String[] args) throws IOException, WavFileException {
        // TODO code application logic here
        
       
        int choice = args[0].equals("Hide") ? 1 : 2;
        
        /*detect format - WAV or MP3*/
        String extension = "";
        int i = args[4-choice].lastIndexOf('.'); // if choice = 1 (Hide) 4-1=3, else 4-2=2
        if (i > 0) {
            extension = args[4-choice].substring(i+1);
        }
        
        if (extension.equals("wav")) {
            
            FileInputStream in = null;
            FileOutputStream out = null;
            WavFile fileIn = null;
            WavFile fileOut = null;
            SteganographyWav stegoWav = new SteganographyWav();
            try {
                
                
                if (choice == 1) { // Hide
                    fileIn = WavFile.openWavFile(new File(args[3]));
                    String fileOutName = new String(args[4]);
    
                    fileOut = WavFile.newWavFile(new File(fileOutName), fileIn.getNumChannels(), fileIn.getNumFrames(), fileIn.getValidBits(), fileIn.getSampleRate());
                    
                    int choice2 = args[1].equals("string") ? 1 : 2;
    
                    if (choice2 == 1) { //string
                        String message = new String(args[2]);
                        stegoWav.encryptMessage(message , fileIn, fileOut);
                    } else if (choice2 == 2) { //file
                        in = new FileInputStream(args[2]);
    
                        // One bit is hidden in one frame, so filesize in bits must be > frame number 
                        if (in.getChannel().size() * 8 > fileIn.getNumFrames()) {
                            System.out.println("sorry, for this .wav file, maximum size is " + fileIn.getNumFrames() / 8);
                            return;
                        }
                        stegoWav.encryptMessage(in, fileIn, fileOut);
                    }
                } else if (choice == 2) { //Retrieve
                    fileIn = WavFile.openWavFile(new File(args[2]));
                    int choice2 = args[1].equals("string") ? 1 : 2;
                    
                    if (choice2 == 1) { //string
                       System.out.print(stegoWav.decryptMessage(fileIn));
                    } else if (choice2 == 2) { //file
                        out = new FileOutputStream(args[3]);
                        stegoWav.decryptMessage(fileIn, out);
                    }
                }
    
            } finally {
                if (fileIn != null) {
                    fileIn.close();
                }
                if (fileOut != null) {
                    fileOut.close();
                }
                if (in != null) {
                    in.close();
                }
                if (out != null) {
                    out.close();
                }
    
            }
        
        } else if (extension.equals("mp3")) {
            
        }
        /**/
    }

}
