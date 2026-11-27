#!/usr/bin/env bash
set -euo pipefail

OUT=samples
mkdir -p "$OUT/hls"
F="ffmpeg -hide_banner -loglevel error -y"
SRC="$OUT/master.mkv"

$F \
  -f lavfi -i "color=c=0xDC2828:s=64x64:r=10:d=1" \
  -f lavfi -i "color=c=0x28BE46:s=64x64:r=10:d=1" \
  -f lavfi -i "color=c=0x2846DC:s=64x64:r=10:d=1" \
  -f lavfi -i "color=c=0xF0C828:s=64x64:r=10:d=1" \
  -filter_complex "[0][1][2][3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0,scale=out_color_matrix=bt709:out_range=tv,format=yuv444p10le" \
  -c:v ffv1 "$SRC"

TAG="-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -an"
X264="-c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p $TAG"

$F -i "$SRC" $X264 -profile:v high -movflags +faststart "$OUT/h264.mp4"
$F -i "$SRC" -c:v libx265 -preset veryfast -crf 20 -pix_fmt yuv420p -tag:v hvc1 -x265-params log-level=error $TAG "$OUT/hevc.mp4"
$F -i "$SRC" -c:v libx265 -preset veryfast -crf 20 -pix_fmt yuv420p10le -profile:v main10 -tag:v hvc1 -x265-params log-level=error $TAG "$OUT/hevc10.mp4"
$F -i "$SRC" -c:v libaom-av1 -cpu-used 8 -crf 28 -b:v 0 -pix_fmt yuv420p $TAG "$OUT/av1.mp4"
$F -i "$SRC" -c:v libaom-av1 -cpu-used 8 -crf 28 -b:v 0 -pix_fmt yuv420p10le $TAG "$OUT/av1_10.mp4"
$F -i "$SRC" -c:v libvpx-vp9 -crf 28 -b:v 0 -pix_fmt yuv420p $TAG "$OUT/vp9.webm"
$F -i "$SRC" -c:v libvpx-vp9 -crf 28 -b:v 0 -pix_fmt yuv420p10le -profile:v 2 $TAG "$OUT/vp9_10.webm"
$F -i "$SRC" -c:v libvpx -crf 10 -b:v 1M -pix_fmt yuv420p $TAG "$OUT/vp8.webm"
$F -i "$SRC" -c:v libtheora -q:v 8 -pix_fmt yuv420p -an "$OUT/theora.ogv"
$F -i "$SRC" -c:v prores_ks -profile:v 3 -pix_fmt yuv422p10le $TAG "$OUT/prores.mov"

$F -i "$SRC" $X264 "$OUT/h264.mov"
$F -i "$SRC" $X264 "$OUT/h264.mkv"
$F -i "$SRC" $X264 -f mpegts "$OUT/h264.ts"
$F -i "$SRC" $X264 -f 3gp "$OUT/h264.3gp"
$F -i "$SRC" $X264 -f flv "$OUT/h264.flv"
$F -i "$SRC" $X264 -f hls -hls_time 1 -hls_playlist_type vod -hls_segment_filename "$OUT/hls/seg%d.ts" "$OUT/hls/index.m3u8"

$F -i "$SRC" -c:v mpeg4 -vtag xvid -q:v 2 -pix_fmt yuv420p -an "$OUT/mpeg4.avi"
$F -i "$SRC" -c:v mpeg1video -r 25 -q:v 2 -pix_fmt yuv420p -an -f mpeg "$OUT/mpeg1.mpg"
$F -i "$SRC" -c:v wmv2 -q:v 2 -pix_fmt yuv420p -an "$OUT/wmv2.wmv"

TONE="-f lavfi -i sine=frequency=440:duration=1:sample_rate=48000 -vn"
$F $TONE -c:a aac -b:a 96k "$OUT/aac.m4a"
$F $TONE -c:a libmp3lame -b:a 96k "$OUT/mp3.mp3"
$F $TONE -c:a libopus -b:a 64k "$OUT/opus.ogg"
$F $TONE -c:a libopus -b:a 64k "$OUT/opus.webm"
$F $TONE -c:a libvorbis -q:a 4 "$OUT/vorbis.ogg"
$F $TONE -c:a flac "$OUT/flac.flac"
$F $TONE -c:a pcm_s16le "$OUT/wav.wav"
$F $TONE -c:a alac "$OUT/alac.m4a"
$F $TONE -c:a ac3 -b:a 96k "$OUT/ac3.mp4"
$F $TONE -c:a eac3 -b:a 96k -strict -2 "$OUT/eac3.mp4"

rm "$SRC"
ls -l "$OUT" "$OUT/hls"
