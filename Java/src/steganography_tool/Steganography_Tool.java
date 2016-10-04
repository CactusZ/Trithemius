/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Java.src.steganography_tool;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Scanner;

/**
 *
 * @author igork
 */
public class Steganography_Tool {

    /**
     * @param args the command line arguments
     */
    public static final int bitsLength = 32;// how many bits for message length

    public static void encryptBuffer(long[] buffer, int x, int channelCount, int bitsLength) {

        for (int i = 0; i < bitsLength * channelCount; i += channelCount) {
            buffer[i] = ((buffer[i] >> 1) << 1) ^ (x % 2);
            x = x >> 1;
        }
    }

    public static void encryptMessage(String message, WavFile fileIn, WavFile fileOut) {

        try {

            // Get the number of audio channels in the wav file
            int numChannels = fileIn.getNumChannels();

            // Create a buffer for messageLength
            long[] buffer = new long[bitsLength * numChannels];

            //encrypting message length
            int messageLength = message.length();

            fileIn.readFrames(buffer, bitsLength);
            encryptBuffer(buffer, messageLength, numChannels, bitsLength);
            fileOut.writeFrames(buffer, bitsLength);

            //encrypting message
            buffer = new long[8 * numChannels];
            int i = 0;
            int framesRead;
            do {
                framesRead = fileIn.readFrames(buffer, 8);
                if (i < messageLength) {
                    encryptBuffer(buffer, (int) message.charAt(i), numChannels, 8);
                    i++;
                }
                fileOut.writeFrames(buffer, 8);
            } while (framesRead != 0);

        } catch (Exception e) {
            System.err.println(e);
        }
    }

    public static void encryptMessage(FileInputStream messageFile, WavFile fileIn, WavFile fileOut) {

        try {
            // Get the number of audio channels in the wav file
            int numChannels = fileIn.getNumChannels();

            // Create a buffer for messageLength
            long[] buffer = new long[bitsLength * numChannels];

            //encrypting message length
            int messageLength = (int) messageFile.getChannel().size();
            System.out.println(messageLength);
            fileIn.readFrames(buffer, bitsLength);
            encryptBuffer(buffer, messageLength, numChannels, bitsLength);
            fileOut.writeFrames(buffer, bitsLength);

            //encrypting message
            buffer = new long[8 * numChannels];
            int bytebuf;
            int i = 0;
            int framesRead;
            do {
                framesRead = fileIn.readFrames(buffer, 8);
                if (i < messageLength) {
                    bytebuf = messageFile.read();
                    encryptBuffer(buffer, bytebuf, numChannels, 8);
                    //           writer.write(bytebuf + "\n");
                    i++;
                }
                fileOut.writeFrames(buffer, 8);
            } while (framesRead != 0);

        } catch (Exception e) {
            System.err.println(e);
        }
    }

    public static int decryptBuffer(long[] buffer, int channelCount, int bitsLength) {
        int res = 0;
        int power2 = 1;
        for (int i = 0; i < bitsLength * channelCount; i += channelCount) {
            res = (res) + ((int) (buffer[i] % 2) & 1) * (power2);
            power2 = power2 << 1;
        }
        return res;
    }

    public static String decryptMessage(WavFile file) {
        String message = new String("");
        try {
            //open file

            int channelCount = file.getNumChannels();
            long[] buffer = new long[bitsLength * channelCount];
            //decrypting length
            file.readFrames(buffer, bitsLength);
            int messageLength = decryptBuffer(buffer, channelCount, bitsLength);

            buffer = new long[8 * channelCount];
            for (int i = 0; i < messageLength; i++) {
                file.readFrames(buffer, 8);
                message += (char) decryptBuffer(buffer, channelCount, 8);
            }

        } catch (Exception e) {
            System.err.println(e);
        }
        return message;
    }

    public static int decryptMessage(WavFile file, FileOutputStream out) {
        int messageLength = 0;
        try {
            int channelCount = file.getNumChannels();
            long[] buffer = new long[bitsLength * channelCount];
            
            //decrypting length
            file.readFrames(buffer, bitsLength);
            messageLength = decryptBuffer(buffer, channelCount, bitsLength);
            System.out.println(messageLength);
            buffer = new long[8 * channelCount];
            int bytebuf;
            for (int i = 0; i < messageLength; i++) {
                file.readFrames(buffer, 8);
                bytebuf = decryptBuffer(buffer, channelCount, 8);
                //        writer.write(bytebuf + "\n");
                out.write(bytebuf);

            }

        } catch (Exception e) {
            System.err.println(e);
        }
        return messageLength;
    }

    /* args
            0              1                 2       3           4
           Hide TypeOfObject[string file] Object WhereToHide ResultName
           
              0                1                 2       3  
           Retrieve TypeOfObject[string file]  Carrier  Result 
    */
    public static void main(String[] args) throws IOException, WavFileException {
        // TODO code application logic here
        int choice;
        Scanner scanner = new Scanner(System.in);
        if (args.length==0)  {
            
            System.out.println("1 - Hide. 2 - Retrieve");
            choice = Integer.parseInt(scanner.nextLine());
        } else {
            choice = args[0].equals("Hide") ? 1 : 2;
        }
        FileInputStream in = null;
        FileOutputStream out = null;
        WavFile fileIn = null;
        WavFile fileOut = null;
        try {
            if (choice == 1) {
                String fileName;
                if (args.length==0)  {
                    System.out.println("Your .wav file?");
                    fileName=new String(scanner.nextLine());
                } else {
                    fileName=new String(args[3]);
                }
                    
                fileIn = WavFile.openWavFile(new File(fileName));
                
                //System.out.println(fileIn.getFramesRemaining());
                String fileOutName;
                if (args.length==0)  {
                    fileIn.display();/* DEBUG info */
                    System.out.println("Result .wav file name?");
                    fileOutName=new String(scanner.nextLine());
                } else {
                    fileOutName=new String(args[4]);
                }
                fileOut = WavFile.newWavFile(new File(fileOutName), fileIn.getNumChannels(), fileIn.getNumFrames(), fileIn.getValidBits(), fileIn.getSampleRate());
                
                int choice2;
                if(args.length==0){
                    System.out.println("What do you want to hide?");
                    System.out.println("1. String message");
                    System.out.println("2. File");
                    choice2 = Integer.parseInt(scanner.nextLine());
                } else {
                    choice2 = args[1].equals("string") ? 1 : 2;
                }
                if (choice2 == 1) {
                    String message;
                    if (args.length==0){
                        System.out.print("message:");
                        message = new String(scanner.nextLine());
                    } else {
                        message = new String(args[2]);
                    }
                    encryptMessage(message , fileIn, fileOut);
                } else if (choice2 == 2) {
                    if(args.length==0){
                        System.out.print("filename:");
                        in = new FileInputStream(scanner.nextLine());
                    } else {
                        in = new FileInputStream(args[2]);
                    }
                    if (in.getChannel().size() * 8 > fileIn.getNumFrames()) {
                        System.out.println("sorry, for this .wav file, maximum size is " + fileIn.getNumFrames() / 8);
                        return;
                    }
                    encryptMessage(in, fileIn, fileOut);
                }
            } else if (choice == 2) {
                
                if (args.length>0) {
                    fileIn = WavFile.openWavFile(new File(args[2]));
                } else {
                    System.out.println("Where is information?");
                    fileIn = WavFile.openWavFile(new File(scanner.nextLine()));
                }
                int choice2;
                if (args.length > 0) {
                    choice2 = args[1].equals("string") ? 1 : 2;
                } else {
                    System.out.println("What is it?");
                    System.out.println("1. String message");
                    System.out.println("2. File");
                    choice2 = Integer.parseInt(scanner.nextLine());
                }
                if (args.length==0) {
                    if (choice2 == 1) {
                        System.out.print("message:" + decryptMessage(fileIn) + "\n");
                    } else if (choice2 == 2) {
                        System.out.print("result filename:");
                        out = new FileOutputStream(scanner.nextLine());
                        decryptMessage(fileIn, out);
                    }
                } else {
                    if (choice2 == 1) {
                        System.out.println(decryptMessage(fileIn));
                    } else if (choice2 == 2) {
                        out = new FileOutputStream(args[3]);
                        decryptMessage(fileIn, out);
                    }
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
        
        /**/
    }

}
