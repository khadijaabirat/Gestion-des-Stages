<?php
require 'vendor/autoload.php';
$vapid = Minishlink\WebPush\VAPID::createVapidKeys();
echo json_encode($vapid);
