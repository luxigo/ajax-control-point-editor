<?php

$eqr_datadir='../data/equirectangular_maps/';

if ($_POST['cmd']=='src') {
  passthru("../getCenterPixel/getPixelOrigin ".$eqr_datadir.$_POST['chan'].'.eqr-tiff '.$_POST['x'].' '.$_POST['y']);
  exit(0);
}

if ($_POST['cmd']=='dst') {
  passthru("../getCenterPixel/mapSensorPixel ".$eqr_datadir.$_POST['chan'].'.eqr-tiff '.$_POST['x'].' '.$_POST['y']);
  exit(0);
}

?>

