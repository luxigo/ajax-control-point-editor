<?php

function sign($value) {
  return ($value<0)?-1:($value>0)?1:0;
}

function getCalibData($tag) {
  global $calibxml;
  $value=system("grep \\<$tag\\> $calibxml | sed -r -n -e 's/[^0-9\\.]+//gp'");
  return $value;
}

$dir=urldecode($_POST['dir']);
$timestamp=urldecode($_POST['t']);
$chan=urldecode($_POST['chan']);
//$rotation=urldecode($_POST['r']);

$src="$dir/$timestamp-$chan-DECONV-RGB24";
$dst="../jpg/$timestamp-$chan-DECONV-RGB24";
$esrc=escapeshellarg($src);
$edst=escapeshellarg($dst);
$calibxml=escapeshellarg("../calibration_data/$chan.xml");

if (!file_exists($dst.".jpg")) {
  exec("convert ".$esrc.".tiff -resize 50% ".$edst.".jpg");

/*
  $rotation=getCalibData('roll');
  $px0=getCalibData('px0');
  $py0=getCalibData('py0');
  $rotation=intval(($rotation+sign($rotation,0)*45)/90)*90;
  if ($rotation==90) {
    exec("convert ".$esrc.".tiff -resize 50% -transpose -flop ".$edst.".jpg");
  } else if ($rotation==-90) {
    exec("convert ".$esrc.".tiff -resize 50% -transverse -flip ".$edst.".jpg");
  } else {
    exec("convert ".$esrc.".tiff -rotate ".escapeshellarg(intval(($rotation+sign($rotation,0)*45)/90)*90)." -resize 50% ".$edst.".jpg");
  }
*/
}

if (!file_exists($dst."_EQR.jpg")) {
  exec("convert ".$esrc."_EQR.tiff ".$edst."_EQR.jpg");
}

exit(0);

?>
