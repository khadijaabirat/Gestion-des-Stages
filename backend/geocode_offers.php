<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\OffreStage;
use Illuminate\Support\Facades\Http;

$offres = OffreStage::whereNull('latitude')->get();
foreach($offres as $o) {
    $loc = $o->localisation;
    if(!$loc) continue;
    $response = Http::withHeaders(['User-Agent' => 'GestionStages/1.0'])->get('https://nominatim.openstreetmap.org/search', ['format'=>'json', 'q'=>$loc, 'limit'=>1]);
    $data = $response->json();
    if(is_array($data) && count($data)>0) {
        $o->latitude = $data[0]['lat'];
        $o->longitude = $data[0]['lon'];
        $o->save();
        echo "Geocoded: $loc\n";
    } else {
        echo "Not found: $loc\n";
    }
    sleep(1);
}
echo "Done.\n";
